// AdminUserManager.jsx
import { useEffect, useMemo, useState } from 'react';
import adminService from '../services/adminService';

// Optional: put this in an .env and read in adminService
// const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminUserManager = () => {
  const [role, setRole] = useState('all');

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedParent, setSelectedParent] = useState(null);
  const [children, setChildren] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // -------------------------
  // Fetch users when role changes
  // -------------------------
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data =
        role === 'all'
          ? await adminService.getAllUsers()
          : await adminService.getUsersByRole(role);

      // In case your service returns {data: [...]}
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setUsers(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err?.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // -------------------------
  // Search (debounced)
  // -------------------------
  const [debouncedTerm, setDebouncedTerm] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!debouncedTerm) return users;
    const q = debouncedTerm.toLowerCase();
    return users.filter((u) => {
      const name = (u.fullName || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const nic = (u.nic || '').toLowerCase(); // (fix) case-insensitive NIC search
      return name.includes(q) || email.includes(q) || nic.includes(q);
    });
  }, [users, debouncedTerm]);

  // -------------------------
  // Current page slice
  // -------------------------
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const pageSafe = Math.min(currentPage, totalPages);
  const indexOfLast = pageSafe * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    // if filtering shrinks page count, snap back to last valid page
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // -------------------------
  // CRUD & actions
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      setMessage('User deleted.');
      await fetchUsers();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleEdit = (user) => {
    setEditingUser({ ...user }); // clone
  };

  const handleUpdate = async () => {
    if (!editingUser?._id) return;
    setSaving(true);
    try {
      await adminService.editUser(editingUser._id, editingUser);
      setMessage('User updated.');
      setEditingUser(null);
      await fetchUsers();
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
      await fetchUsers();
    } catch (e) {
      setError(e?.response?.data?.message || 'Approval failed.');
    }
  };

  const rejectUser = async (id) => {
    try {
      await adminService.rejectStudent(id);
      setMessage('User rejected.');
      await fetchUsers();
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

  // -------------------------
  // Parent → Children (by NIC)
  // -------------------------
  const handleSearchParent = async () => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setSelectedParent(null);
      setChildren([]);
      return;
    }

    // find parent in current list (or fetch all parents if needed)
    const parent = users.find((u) => (u.nic || '').toLowerCase() === q && u.role === 'parent');

    if (!parent) {
      setSelectedParent(null);
      setChildren([]);
      setMessage('No parent found for that NIC.');
      return;
    }

    try {
      setSelectedParent(parent);
      const studentsData = await adminService.getUsersByRole('student');
      const allStudents = Array.isArray(studentsData) ? studentsData : (studentsData?.data ?? []);
      const related = allStudents.filter((std) => std.parentPhone && std.parentPhone === parent.phone);
      setChildren(related);
    } catch (e) {
      setError('Failed to fetch related students.');
      setChildren([]);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="admin-user-manager">
      <h2>User Management Panel</h2>

      {!!message && <div className="toast success">{message}</div>}
      {!!error && <div className="toast error">{error}</div>}

      <div className="toolbar">
        <label>
          Role:&nbsp;
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Search by name, email, or NIC"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={handleSearchParent} disabled={!searchTerm.trim() || loading}>
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
      ) : currentUsers.length === 0 ? (
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
            {currentUsers.map((user) => {
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
                        <button onClick={() => handleEdit(user)}>Edit</button>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe === 1}
          >
            ‹ Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={pageSafe === n ? 'active' : ''}
              onClick={() => setCurrentPage(n)}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageSafe === totalPages}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
