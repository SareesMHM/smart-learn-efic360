import { useState, useEffect } from 'react';
import axios from 'axios';


const VerificationCenter = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const res = await axios.get('/api/admin/users');
    setUsers(res.data.users);
  };

  const resendEmail = async (id) => {
    await axios.post(`/api/verification/resend/${id}`);
    alert('Verification email resent');
  };

  return (
    <div>
      <h2>Email Verification Center</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.isValidEmail ? ' Verified' : ' Not Verified'}</td>
              <td>
                {!user.isValidEmail && (
                  <button onClick={() => resendEmail(user._id)}>Resend Email</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationCenter;
