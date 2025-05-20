// AdminUserManager.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const AdminUserManager = () => {
  const [role, setRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [role]);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const data = role === 'all'
        ? (await axios.get('http://localhost:5000/api/admin/users')).data
        : await adminService.getUsersByRole(role);
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setMessage('Failed to fetch users.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this user?')) {
      await adminService.deleteUser(id);
      fetchUsers();
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleUpdate = async () => {
    await adminService.editUser(editingUser._id, editingUser);
    setEditingUser(null);
    fetchUsers();
  };

  const handleSearchParent = async () => {
    const parent = users.find(u => u.nic === searchTerm);
    if (parent && parent.role === 'parent') {
      setSelectedParent(parent);
      const allStudents = await adminService.getUsersByRole('student');
      const relatedStudents = allStudents.filter(std => std.parentPhone === parent.phone);
      setChildren(relatedStudents);
    } else {
      setSelectedParent(null);
      setChildren([]);
    }
  };

  const approveUser = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/students/${id}/approve`);
      setMessage('User approved.');
      fetchUsers();
    } catch {
      setMessage('Approval failed.');
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/students/${id}/reject`);
      setMessage('User rejected.');
      fetchUsers();
    } catch {
      setMessage('Rejection failed.');
    }
  };

  const resendEmail = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/resend-email/${id}`);
      setMessage('Verification email resent.');
    } catch {
      setMessage('Failed to resend verification email.');
    }
  };

  const handleSearch = (term) => {
    const lower = term.toLowerCase();
    const filtered = users.filter(user =>
      user.fullName?.toLowerCase().includes(lower) ||
      user.email?.toLowerCase().includes(lower) ||
      user.nic?.includes(lower)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="admin-user-manager">
      <h2>User Management Panel</h2>

      {message && <div className="toast">{message}</div>}

      <label>Role:
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">All</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
      </label>

      <input
        type="text"
        placeholder="Search by name, email or NIC"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button onClick={handleSearchParent}>Search Parent NIC</button>

      {selectedParent && (
        <div>
          <h4>Parent: {selectedParent.fullName}</h4>
          <p>Phone: {selectedParent.phone}</p>
          <p>Children count: {children.length}</p>
          {children.map(child => (
            <div key={child._id}>
              <p>{child.fullName} - Grade {child.gradeId}</p>
            </div>
          ))}
        </div>
      )}

      {currentUsers.length === 0 ? (
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(user => (
              <tr key={user._id}>
                <td>
                  {editingUser?._id === user._id ? (
                    <input
                      value={editingUser.fullName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                    />
                  ) : user.fullName}
                </td>
                <td>{user.email}</td>
                <td>{user.nic}</td>
                <td>{user.role}</td>
                <td>{user.isApproved ? 'Approved' : 'Pending'}</td>
                <td>
                  {editingUser?._id === user._id ? (
                    <button onClick={handleUpdate}>Save</button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(user)}>Edit</button>
                      <button onClick={() => handleDelete(user._id)}>Delete</button>
                      {user.role === 'student' && !user.isApproved && (
                        <>
                          <button onClick={() => approveUser(user._id)}>✅ Approve</button>
                          <button onClick={() => rejectUser(user._id)}>❌ Reject</button>
                          {!user.isValidEmail && (
                            <button onClick={() => resendEmail(user._id)}>✉️ Resend</button>
                          )}
                        </>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? 'active' : ''}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
