// controllers/accessLogController.js
const AccessLog = require("../models/AccessLog");
const ExcelJS = require("exceljs");
const { startOfDay, endOfDay, subDays } = require("date-fns");

// small util
const pick = (obj, keys) =>
  keys.reduce((o, k) => (obj[k] !== undefined ? ((o[k] = obj[k]), o) : o), {});

// Normalize filters from querystring
function buildFilters(query) {
  const { q, from, to, role, action, userId, ip } = query;
  const filter = {};

  if (role) filter.role = role;
  if (action) filter.action = action; // "login" | "logout"
  if (userId) filter.userId = userId;
  if (ip) filter.ip = ip;

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = endOfDay(new Date(to));
  }

  if (q) {
    const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ role: rx }, { action: rx }, { ip: rx }, { userAgent: rx }];
  }

  return filter;
}

// Treat "success" flexibly: true if success===true OR meta.success===true
// If field is missing, we *assume success* for counts when appropriate.
const successTrueOrUnknown = {
  $or: [
    { success: true },
    { "meta.success": true },
    { $and: [{ success: { $exists: false } }, { "meta.success": { $exists: false } }] },
  ],
};

const successFalse = { $or: [{ success: false }, { "meta.success": false }] };

exports.listLogs = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || "50", 10)));
  const { sortBy = "timestamp", sortDir = "desc" } = pick(req.query, ["sortBy", "sortDir"]);
  const sort = { [sortBy]: sortDir.toLowerCase() === "asc" ? 1 : -1 };

  const filter = buildFilters(req.query);

  const [items, total] = await Promise.all([
    AccessLog.find(filter)
      .populate("userId", "fullName email role")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AccessLog.countDocuments(filter),
  ]);

  res.json({ page, limit, total, pages: Math.ceil(total / limit), data: items });
};

exports.stats = async (req, res) => {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const weekStart = subDays(todayStart, 6);

  const [today, week, dailySeries] = await Promise.all([
    AccessLog.countDocuments({
      action: "login",
      timestamp: { $gte: todayStart, $lte: todayEnd },
      ...successTrueOrUnknown,
    }),
    AccessLog.countDocuments({
      action: "login",
      timestamp: { $gte: weekStart, $lte: todayEnd },
      ...successTrueOrUnknown,
    }),
    AccessLog.aggregate([
      {
        $match: {
          action: { $in: ["login", "logout"] },
          timestamp: { $gte: weekStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            action: "$action",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.day",
          counts: { $push: { action: "$_id.action", count: "$count" } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const daily = dailySeries.map((d) => {
    const obj = { date: d._id, login: 0, logout: 0 };
    for (const c of d.counts) obj[c.action] = c.count;
    return obj;
  });

  res.json({ today, week, daily });
};

exports.suspicious = async (req, res) => {
  const now = new Date();

  // A) Many failed logins from same IP in last 6 hours
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const failedByIp = await AccessLog.aggregate([
    {
      $match: {
        action: "login",
        timestamp: { $gte: sixHoursAgo, $lte: now },
        ...successFalse, // only where failure is recorded
      },
    },
    {
      $group: {
        _id: "$ip",
        count: { $sum: 1 },
        first: { $min: "$timestamp" },
        last: { $max: "$timestamp" },
      },
    },
    { $match: { count: { $gte: 5 } } },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  // B) One IP successfully logging into many users in last 1 hour
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const ipManyUsers = await AccessLog.aggregate([
    {
      $match: {
        action: "login",
        timestamp: { $gte: oneHourAgo, $lte: now },
      },
    },
    {
      $addFields: {
        isSuccess: { $ifNull: ["$success", { $ifNull: ["$meta.success", true] }] },
      },
    },
    { $match: { isSuccess: true } },
    {
      $group: {
        _id: "$ip",
        users: { $addToSet: "$userId" },
        count: { $sum: 1 },
        first: { $min: "$timestamp" },
        last: { $max: "$timestamp" },
      },
    },
    { $project: { ip: "$_id", count: 1, usersCount: { $size: "$users" }, first: 1, last: 1 } },
    { $match: { count: { $gte: 10 }, usersCount: { $gte: 5 } } },
    { $sort: { count: -1 } },
    { $limit: 50 },
  ]);

  // C) One user successfully logging from many IPs in last 1 hour
  const userManyIps = await AccessLog.aggregate([
    {
      $match: {
        action: "login",
        timestamp: { $gte: oneHourAgo, $lte: now },
      },
    },
    {
      $addFields: {
        isSuccess: { $ifNull: ["$success", { $ifNull: ["$meta.success", true] }] },
      },
    },
    { $match: { isSuccess: true } },
    {
      $group: {
        _id: "$userId",
        ips: { $addToSet: "$ip" },
        count: { $sum: 1 },
        first: { $min: "$timestamp" },
        last: { $max: "$timestamp" },
      },
    },
    { $project: { userId: "$_id", ipsCount: { $size: "$ips" }, count: 1, first: 1, last: 1 } },
    { $match: { ipsCount: { $gte: 3 } } },
    { $sort: { ipsCount: -1 } },
    { $limit: 50 },
  ]);

  res.json({
    failedBursts: failedByIp.map((x) => ({
      type: "failed_burst_by_ip",
      ip: x._id,
      count: x.count,
      windowStart: x.first,
      windowEnd: x.last,
    })),
    ipManyUsers: ipManyUsers.map((x) => ({
      type: "ip_many_users",
      ip: x.ip,
      totalLogins: x.count,
      distinctUsers: x.usersCount,
      windowStart: x.first,
      windowEnd: x.last,
    })),
    userManyIps: userManyIps.map((x) => ({
      type: "user_many_ips",
      userId: x.userId,
      totalLogins: x.count,
      distinctIps: x.ipsCount,
      windowStart: x.first,
      windowEnd: x.last,
    })),
  });
};

exports.exportExcel = async (req, res) => {
  const filter = buildFilters(req.query);
  const rows = await AccessLog.find(filter)
    .populate("userId", "fullName email role")
    .sort({ timestamp: -1 })
    .limit(50_000) // safety cap
    .lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Access Logs");

  sheet.columns = [
    { header: "Date/Time",   key: "timestamp", width: 22 },
    { header: "User Name",   key: "userName",  width: 24 },
    { header: "Email",       key: "email",     width: 28 },
    { header: "Role",        key: "role",      width: 14 },
    { header: "Action",      key: "action",    width: 14 },
    { header: "Success",     key: "success",   width: 10 },
    { header: "IP",          key: "ip",        width: 18 },
    { header: "User Agent",  key: "ua",        width: 60 },
  ];

  rows.forEach((r) =>
    sheet.addRow({
      timestamp: new Date(r.timestamp).toISOString(),
      userName: r.userId?.fullName || "",
      email: r.userId?.email || "",
      role: r.role || r.userId?.role || "",
      action: r.action,
      success:
        r.success ?? (r.meta && typeof r.meta.success === "boolean" ? r.meta.success : ""),
      ip: r.ip,
      ua: r.userAgent,
    })
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="access-logs_${new Date().toISOString().slice(0, 10)}.xlsx"`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await workbook.xlsx.write(res);
  res.end();
};
