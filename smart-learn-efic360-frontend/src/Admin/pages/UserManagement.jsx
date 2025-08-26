// AdminUserManager.jsx
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const AdminUserManager = () => {
  const [role, setRole] = useState('all');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [perPage, setPerPage] = useState(limit);

  const [selectedParent, setSelectedParent] = useState(null);
  const [children, setChildren] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // -------- Fetch (server-side pagination) --------
  const load = async (opts = {}) => {
    setLoading(true);
    setError('');
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
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  // Load on role/page change
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, page]);

  // Debounce search -> reset to page 1 then load
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load({ page: 1 });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // -------- CRUD & actions --------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setMessage('User deleted.');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleEdit = (user) => setEditingUser({ ...user });

  const handleUpdate = async () => {
    if (!editingUser?._id) return;
    setSaving(true);
    try {
      await adminService.editUser(editingUser._id, { fullName: editingUser.fullName });
      setMessage('User updated.');
      setEditingUser(null);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const approveUser = async (id) => {
    try {
      await adminService.approveStudent(id);
      setMessage('User approved.');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Approval failed.');
    }
  };

  const rejectUser = async (id) => {
    try {
      await adminService.rejectStudent(id);
      setMessage('User rejected.');
      load();
    } catch (e) {
      setError(e?.response?.data?.message || 'Rejection failed.');
    }
  };

  const resendEmail = async (id) => {
    try {
      await adminService.resendVerificationEmail(id);
      setMessage('Verification email resent.');
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  // -------- Parent → Children (by NIC, using API search) --------
  const handleSearchParent = async () => {
    const nicQ = q.trim();
    if (!nicQ) {
      setSelectedParent(null);
      setChildren([]);
      return;
    }
    try {
      // Find parent by NIC via server search (restrict role=parent)
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

      // Find related students by parentPhone (server search hits phone field)
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

  // -------- UI --------
  return (
    <div className="admin-user-manager">
      <h2>User Management Panel</h2>

      {!!message && <div className="toast success">{message}</div>}
      {!!error && <div className="toast error">{error}</div>}

      <div className="toolbar">
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
        />

        <button onClick={handleSearchParent} disabled={!q.trim() || loading}>
          Search Parent NIC
        </button>
      </div>

      {selectedParent && (
        <div className="parent-card">
          <h4>Parent: {selectedParent.fullName}</h4>
          <p>Phone: {selectedParent.phone}</p>
          <p>Children: {children.length}</p>
          {children.map((c) => (
            <div key={c._id}>
              <p>
                {c.fullName} — Grade {c.gradeId}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading users…</p>
      ) : rows.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>NIC</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ minWidth: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => {
              const isEditing = editingUser?._id === user._id;
              return (
                <tr key={user._id}>
                  <td>
                    {isEditing ? (
                      <input
                        value={editingUser.fullName || ''}
                        onChange={(e) =>
                          setEditingUser((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.nic}</td>
                  <td>{user.role}</td>
                  <td>{user.isApproved ? 'Approved' : 'Pending'}</td>
                  <td>
                    {isEditing ? (
                      <>
                        <button onClick={handleUpdate} disabled={saving}>
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingUser(null)} disabled={saving}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingUser(user)}>Edit</button>
                        <button onClick={() => handleDelete(user._id)}>Delete</button>

                        {user.role === 'student' && !user.isApproved && (
                          <>
                            <button onClick={() => approveUser(user._id)}>✅ Approve</button>
                            <button onClick={() => rejectUser(user._id)}>❌ Reject</button>
                            {user.isValidEmail === false && (
                              <button onClick={() => resendEmail(user._id)}>✉️ Resend</button>
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
        <div className="pagination">
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
