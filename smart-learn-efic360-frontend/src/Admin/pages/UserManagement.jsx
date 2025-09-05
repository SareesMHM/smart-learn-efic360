// src/pages/AdminUserManager.jsx
import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const PAGE_SIZES = [10, 20, 50, 100];

const AdminUserManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [role, setRole] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_SIZES[0]);

  const [sortKey, setSortKey] = useState('createdAt'); // createdAt | fullName | email | role | isApproved | gradeId
  const [sortDir, setSortDir] = useState('desc');      // asc | desc

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [perPage, setPerPage] = useState(limit);

  const [selectedParent, setSelectedParent] = useState(null);
  const [children, setChildren] = useState([]);

  const [editing, setEditing] = useState({});      // { [id]: { ...draft } }
  const [savingMap, setSavingMap] = useState({});  // { [id]: boolean }

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // auto-dismiss toasts
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => { setMessage(''); setError(''); }, 4000);
    return () => clearTimeout(t);
  }, [message, error]);

  const clearToasts = () => { setMessage(''); setError(''); };

  const sortParam = `${sortDir === 'desc' ? '-' : ''}${sortKey}`;

  // ---------- Fetch ----------
  const load = async (opts = {}) => {
    setLoading(true);
    clearToasts();
    try {
      const params = {
        role: role === 'all' ? undefined : role,
        q,
        page,
        limit,
        sort: sortParam,
        ...opts,
      };
      const res = await adminService.getAllUsers(params); // expects { total, page, pages, perPage, data }
      setRows(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
      setPerPage(res.perPage || limit);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (e) {
      setRows([]);
      setError(e?.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // initial + deps
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [role, page, sortKey, sortDir, limit]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load({ page: 1 });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q]);

  // ---------- Edit helpers ----------
  const startEdit = (user) => {
    setEditing((prev) => ({
      ...prev,
      [user._id]: {
        fullName: user.fullName || '',
        email: user.email || '',
        nic: user.nic || '',
        role: user.role || 'student',
        isApproved: !!user.isApproved,
        phone: user.phone || '',
        gradeId: user.gradeId || '',
      },
    }));
  };

  const cancelEdit = (id) => {
    setEditing((prev) => { const x = { ...prev }; delete x[id]; return x; });
  };

  const onEditField = (id, key, value) => {
    setEditing((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
  };

  const saveOne = async (id) => {
    const payload = editing[id];
    if (!payload) return;
    setSavingMap((m) => ({ ...m, [id]: true }));
    clearToasts();
    try {
      await adminService.editUser(id, payload);
      setMessage('User updated.');
      cancelEdit(id);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update user.');
    } finally {
      setSavingMap((m) => ({ ...m, [id]: false }));
    }
  };

  const removeOne = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    clearToasts();
    try {
      await adminService.deleteUser(id);
      setMessage('User deleted.');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const approveOne = async (id) => {
    clearToasts();
    try {
      await adminService.approveStudent(id);
      setMessage('User approved.');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Approval failed.');
    }
  };

  const rejectOne = async (id) => {
    clearToasts();
    try {
      await adminService.rejectStudent(id);
      setMessage('User rejected.');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Rejection failed.');
    }
  };

  const resendEmail = async (id) => {
    clearToasts();
    try {
      await adminService.resendVerificationEmail(id);
      setMessage('Verification email resent.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  // ---------- Bulk actions ----------
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(rows.map((r) => r._id)));
      setSelectAll(true);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((curr) => {
      const next = new Set(curr);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const runConcurrent = async (tasks, label) => {
    clearToasts();
    const results = await Promise.allSettled(tasks);
    const ok = results.filter(r => r.status === 'fulfilled').length;
    const fail = results.length - ok;
    if (ok) setMessage(`${label}: ${ok} succeeded${fail ? `, ${fail} failed` : ''}.`);
    if (fail) setError(`${label}: ${fail} failed.`);
    load();
  };

  const bulkApprove = async () => {
    if (!selectedCount) return;
    const ids = rows.filter(r => selectedIds.has(r._id) && r.role === 'student' && !r.isApproved).map(r => r._id);
    if (!ids.length) return setError('No eligible students selected.');
    if (!window.confirm(`Approve ${ids.length} selected user(s)?`)) return;
    await runConcurrent(ids.map(id => adminService.approveStudent(id)), 'Approve');
  };

  const bulkReject = async () => {
    if (!selectedCount) return;
    const ids = rows.filter(r => selectedIds.has(r._id) && r.role === 'student' && r.isApproved).map(r => r._id);
    if (!ids.length) return setError('No approved students selected to reject.');
    if (!window.confirm(`Reject ${ids.length} selected user(s)?`)) return;
    await runConcurrent(ids.map(id => adminService.rejectStudent(id)), 'Reject');
  };

  const bulkDelete = async () => {
    if (!selectedCount) return;
    if (!window.confirm(`Delete ${selectedCount} selected user(s)?`)) return;
    await runConcurrent(selectedList.map(id => adminService.deleteUser(id)), 'Delete');
  };

  // ---------- Parent -> Children by NIC ----------
  const handleSearchParent = async () => {
    clearToasts();
    const nicQ = q.trim();
    if (!nicQ) {
      setSelectedParent(null);
      setChildren([]);
      return;
    }
    try {
      const parentsRes = await adminService.getAllUsers({
        role: 'parent',
        q: nicQ,
        page: 1,
        limit: 5,
        sort: '-createdAt',
      });
      const parent = (parentsRes.data || []).find(
        (p) => (p.nic || '').toLowerCase() === nicQ.toLowerCase()
      );
      if (!parent) {
        setSelectedParent(null);
        setChildren([]);
        setMessage('No parent found for that NIC.');
        return;
      }
      setSelectedParent(parent);

      const studentsRes = await adminService.getAllUsers({
        role: 'student',
        q: parent.phone || '',
        page: 1,
        limit: 100,
        sort: '-createdAt',
      });
      const kids = (studentsRes.data || []).filter(
        (s) => s.parentPhone && s.parentPhone === parent.phone
      );
      setChildren(kids);
    } catch {
      setError('Failed to fetch related students.');
      setChildren([]);
    }
  };

  // ---------- CSV export ----------
  const exportCSV = () => {
    const data = selectedList.length
      ? rows.filter(r => selectedIds.has(r._id))
      : rows;

    const safe = (v) => {
      if (v == null) return '';
      const s = String(v).replace(/"/g, '""');
      return /[,"\n]/.test(s) ? `"${s}"` : s;
    };

    const headers = ['Full Name','Email','NIC','Phone','Grade','Role','Approved','Created At','ID'];
    const lines = [
      headers.join(','),
      ...data.map(u => [
        safe(u.fullName),
        safe(u.email),
        safe(u.nic),
        safe(u.phone),
        safe(u.gradeId),
        safe(u.role),
        safe(u.isApproved ? 'Yes' : 'No'),
        safe(u.createdAt ? new Date(u.createdAt).toLocaleString() : ''),
        safe(u._id),
      ].join(','))
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `users_${selectedList.length ? 'selected_' : ''}${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Sorting UI ----------
  const SortBtn = ({ col, label }) => {
    const active = sortKey === col;
    const dir = active ? sortDir : 'asc';
    return (
      <button
        type="button"
        onClick={() => {
          if (active) setSortDir(dir === 'asc' ? 'desc' : 'asc');
          else { setSortKey(col); setSortDir('asc'); }
          setPage(1);
        }}
        title={`Sort by ${label}`}
        style={{ background: 'none', border: 'none', fontWeight: active ? 700 : 500, cursor: 'pointer' }}
      >
        {label}{' '}{active ? (dir === 'asc' ? '▲' : '▼') : '↕'}
      </button>
    );
  };

  // ---------- UI ----------
  return (
    <div className="app-shell">
      <Header onToggleSidebar={() => setSidebarOpen(v => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-user-manager" style={{ padding: 16 }}>
        <h2>User Management Panel</h2>

        {message && <div className="toast success">{message}</div>}
        {error && <div className="toast error">{error}</div>}

        <div className="toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            Role:&nbsp;
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
            >
              <option value="all">All</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <input
            type="text"
            placeholder="Search by name, email, NIC or phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ minWidth: 280 }}
          />

          <button onClick={handleSearchParent} disabled={!q.trim() || loading}>
            Search Parent NIC
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <label>
              Page size:&nbsp;
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              >
                {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>

            <button onClick={exportCSV} disabled={rows.length === 0}>
              Export CSV {selectedIds.size ? '(selected)' : '(page)'}
            </button>

            <button onClick={bulkApprove} disabled={!selectedIds.size}>Bulk Approve</button>
            <button onClick={bulkReject} disabled={!selectedIds.size}>Bulk Reject</button>
            <button onClick={bulkDelete} disabled={!selectedIds.size}>Bulk Delete</button>
          </div>
        </div>

        {selectedParent && (
          <div className="parent-card" style={{ marginTop: 12 }}>
            <h4>Parent: {selectedParent.fullName}</h4>
            <p>Phone: {selectedParent.phone}</p>
            <p>Children: {children.length}</p>
            {children.map((c) => (
              <div key={c._id}>
                <p>{c.fullName} — Grade {c.gradeId}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p>Loading users…</p>
        ) : rows.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="user-table" style={{ width: '100%', marginTop: 12 }}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    title="Select all on this page"
                  />
                </th>
                <th><SortBtn col="fullName" label="Full Name" /></th>
                <th><SortBtn col="email" label="Email" /></th>
                <th>NIC</th>
                <th><SortBtn col="phone" label="Phone" /></th>
                <th><SortBtn col="gradeId" label="Grade" /></th>
                <th><SortBtn col="role" label="Role" /></th>
                <th><SortBtn col="isApproved" label="Approved" /></th>
                <th><SortBtn col="createdAt" label="Created" /></th>
                <th style={{ minWidth: 320 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => {
                const id = user._id;
                const isEditing = !!editing[id];
                const draft = editing[id] || {};
                const saving = !!savingMap[id];

                return (
                  <tr key={id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => toggleSelectOne(id)}
                      />
                    </td>

                    <td>
                      {isEditing ? (
                        <input value={draft.fullName} onChange={(e) => onEditField(id, 'fullName', e.target.value)} />
                      ) : user.fullName}
                    </td>

                    <td>
                      {isEditing ? (
                        <input value={draft.email} onChange={(e) => onEditField(id, 'email', e.target.value)} />
                      ) : user.email}
                    </td>

                    <td>
                      {isEditing ? (
                        <input value={draft.nic} onChange={(e) => onEditField(id, 'nic', e.target.value)} />
                      ) : user.nic}
                    </td>

                    <td>
                      {isEditing ? (
                        <input value={draft.phone} onChange={(e) => onEditField(id, 'phone', e.target.value)} />
                      ) : user.phone}
                    </td>

                    <td>
                      {isEditing ? (
                        <input value={draft.gradeId} onChange={(e) => onEditField(id, 'gradeId', e.target.value)} placeholder="e.g., 6A" />
                      ) : user.gradeId}
                    </td>

                    <td>
                      {isEditing ? (
                        <select value={draft.role} onChange={(e) => onEditField(id, 'role', e.target.value)}>
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="parent">Parent</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : user.role}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="checkbox"
                          checked={!!draft.isApproved}
                          onChange={(e) => onEditField(id, 'isApproved', e.target.checked)}
                          title="Approved?"
                        />
                      ) : (user.isApproved ? 'Yes' : 'No')}
                    </td>

                    <td>{user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</td>

                    <td>
                      {isEditing ? (
                        <>
                          <button onClick={() => saveOne(id)} disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => cancelEdit(id)} disabled={saving}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(user)}>Edit</button>
                          <button onClick={() => removeOne(id)}>Delete</button>
                          {user.role === 'student' && !user.isApproved && (
                            <>
                              <button onClick={() => approveOne(id)}>✅ Approve</button>
                              <button onClick={() => rejectOne(id)}>❌ Reject</button>
                              {user.isValidEmail === false && (
                                <button onClick={() => resendEmail(id)}>✉️ Resend</button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {pages > 1 && (
          <div className="pagination" style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>

            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} className={page === n ? 'active' : ''} onClick={() => setPage(n)}>{n}</button>
            ))}

            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next ›</button>

            <span style={{ marginLeft: 8 }}>
              Showing {rows.length} of {total} (page {page}/{pages}, {perPage}/page)
            </span>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
};

export default AdminUserManager;
