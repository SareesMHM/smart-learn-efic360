import { useEffect, useMemo, useState } from "react";
import accessLogViewerService from "../services/accessLogViewerService";

const fmt = (d) => {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d ?? "");
  }
};

const AccessLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Simple client-side filters (q search + date range)
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const [logsRes, statsRes, alertsRes] = await Promise.all([
        accessLogViewerService.fetchAllLogs(),
        accessLogViewerService.fetchLoginStats().catch(() => null),
        accessLogViewerService.fetchSuspiciousActivity().catch(() => []),
      ]);
      setLogs(Array.isArray(logsRes) ? logsRes : logsRes?.data ?? []);
      setStats(statsRes);
      setAlerts(Array.isArray(alertsRes) ? alertsRes : alertsRes?.data ?? []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load access logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 86_399_000 : null; // include whole end day

    return logs.filter((r) => {
      const t = new Date(r.timestamp || r.createdAt || r.time).getTime();
      if (fromTs && isFinite(t) && t < fromTs) return false;
      if (toTs && isFinite(t) && t > toTs) return false;

      if (!ql) return true;

      const hay =
        [
          r.userId?.fullName,
          r.user?.fullName,
          r.userEmail,
          r.role,
          r.action,
          r.ip,
          r.userAgent,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";

      return hay.includes(ql);
    });
  }, [logs, q, from, to]);

  const onExport = async () => {
    try {
      const blob = await accessLogViewerService.exportLogsToExcel({
        q: q || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      const url = URL.createObjectURL(
        new Blob([blob], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `access-logs_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to export logs to Excel."
      );
    }
  };

  return (
    <div className="admin-user-manager">
      <h2>Login &amp; Access Logs</h2>

      {err && <div className="toast error">{err}</div>}
      {!err && loading && <div className="toast">Loading logs…</div>}

      <div className="toolbar" style={{ marginTop: 12 }}>
        <label>
          🔎 Search
          <input
            type="text"
            placeholder="Name, email, role, action, IP…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <label>
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={loadAll} disabled={loading}>
            Refresh
          </button>
          <button type="button" onClick={onExport} disabled={loading}>
            Export Excel
          </button>
        </div>
      </div>

      {/* Optional summary cards */}
      <div className="parent-card">
        <h4>Summary</h4>
        <p>Total records: {filtered.length}</p>
        {stats && (
          <>
            <p>Today logins: {stats.today ?? stats?.todayLogins ?? 0}</p>
            <p>This week logins: {stats.week ?? stats?.weekLogins ?? 0}</p>
          </>
        )}
        {!!alerts?.length && <p>Suspicious alerts: {alerts.length}</p>}
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>IP</th>
            <th>Device</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((log) => (
            <tr key={log._id || log.id}>
              <td>
                {log.userId?.fullName ||
                  log.user?.fullName ||
                  log.userEmail ||
                  "—"}
              </td>
              <td>{log.role || "—"}</td>
              <td>{log.action || "—"}</td>
              <td>{log.ip || log.ipAddress || "—"}</td>
              <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {log.userAgent || "—"}
              </td>
              <td>{fmt(log.timestamp || log.createdAt || log.time)}</td>
            </tr>
          ))}
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "#6b7280" }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AccessLogViewer;
