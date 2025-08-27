import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';

const defaultLimit = 10;

const AdminUserManager = () => {
  const [role, setRole] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(defaultLimit);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [perPage, setPerPage] = useState(limit);

  const [selectedParent, setSelectedParent] = useState(null);
  const [children, setChildren] = useState([]);

  const [editing, setEditing] = useState({}); // { [id]: { ...draft fields } }
  const [savingMap, setSavingMap] = useState({}); // { [id]: boolean }

  const [selectedIds, setSelectedIds] = useState(new Set()); // for bulk actions
  const [selectAll, setSelectAll] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearToasts = () => {
    setMessage('');
    setError('');
  };

  // ---------- Fetch ----------
  const load = async (opts = {}) => {
    setLoading(true);
    clearToasts();
    try {
      const params = {
        role,
        q,
        page,
        limit,
        sort: '-createdAt',
        ...opts,
      };
      const res = await adminService.getAllUsers(params); // { total, page, pages, perPage, data }
      setRows(res.data || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
      setPerPage(res.perPage || limit);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [role, page]);

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
    setEditing((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });
  };

  const onEditField = (id, key, value) => {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
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
      load(); // refresh current page
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  const bulkApprove = async () => {
    if (!selectedCount) return;
    if (!window.confirm(`Approve ${selectedCount} selected user(s)?`)) return;
    clearToasts();
    try {
      for (const id of selectedList) {
        await adminService.approveStudent(id);
      }
      setMessage(`Approved ${selectedCount} user(s).`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Bulk approve failed.');
    }
  };

  const bulkReject = async () => {
    if (!selectedCount) return;
    if (!window.confirm(`Reject ${selectedCount} selected user(s)?`)) return;
    clearToasts();
    try {
      for (const id of selectedList) {
        await adminService.rejectStudent(id);
      }
      setMessage(`Rejected ${selectedCount} user(s).`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Bulk reject failed.');
    }
  };

  const bulkDelete = async () => {
    if (!selectedCount) return;
    if (!window.confirm(`Delete ${selectedCount} selected user(s)?`)) return;
    clearToasts();
    try {
      for (const id of selectedList) {
        await adminService.deleteUser(id);
      }
      setMessage(`Deleted ${selectedCount} user(s).`);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Bulk delete failed.');
    }
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

  // ---------- UI ----------
  return (
    <div className="admin-user-manager">
      <h2>User Management Panel</h2>

      {message && <div className="toast success">{message}</div>}
      {error && <div className="toast error">{error}</div>}

      <div className="toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label>
          Role:&nbsp;
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
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

        {/* Bulk actions */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={bulkApprove} disabled={!selectedCount}>Bulk Approve</button>
          <button onClick={bulkReject} disabled={!selectedCount}>Bulk Reject</button>
          <button onClick={bulkDelete} disabled={!selectedCount}>Bulk Delete</button>
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
              <th>Full Name</th>
              <th>Email</th>
              <th>NIC</th>
              <th>Phone</th>
              <th>Grade</th>
              <th>Role</th>
              <th>Approved</th>
              <th>Status</th>
              <th style={{ minWidth: 300 }}>Actions</th>
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
                      <input
                        value={draft.fullName}
                        onChange={(e) => onEditField(id, 'fullName', e.target.value)}
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={draft.email}
                        onChange={(e) => onEditField(id, 'email', e.target.value)}
                      />
                    ) : (
                      user.email
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={draft.nic}
                        onChange={(e) => onEditField(id, 'nic', e.target.value)}
                      />
                    ) : (
                      user.nic
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={draft.phone}
                        onChange={(e) => onEditField(id, 'phone', e.target.value)}
                      />
                    ) : (
                      user.phone
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={draft.gradeId}
                        onChange={(e) => onEditField(id, 'gradeId', e.target.value)}
                        placeholder="e.g., 6A"
                      />
                    ) : (
                      user.gradeId
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={draft.role}
                        onChange={(e) => onEditField(id, 'role', e.target.value)}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={!!draft.isApproved}
                        onChange={(e) => onEditField(id, 'isApproved', e.target.checked)}
                        title="Approved?"
                      />
                    ) : (
                      user.isApproved ? 'Yes' : 'No'
                    )}
                  </td>

                  <td>{user.isApproved ? 'Approved' : 'Pending'}</td>

                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={() => saveOne(id)} disabled={saving}>
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => cancelEdit(id)} disabled={saving}>
                          Cancel
                        </button>
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
        <div className="pagination" style={{ marginTop: 12 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ‹ Prev
          </button>

          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={page === n ? 'active' : ''}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}

          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
            Next ›
          </button>

          <span style={{ marginLeft: 8 }}>
            Showing {rows.length} of {total} (page {page}/{pages}, {perPage}/page)
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
