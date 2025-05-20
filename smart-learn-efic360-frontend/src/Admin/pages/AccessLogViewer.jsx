import { useEffect, useState } from 'react';
import axios from 'axios';

const AccessLogViewer = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/access-logs').then(res => setLogs(res.data));
  }, []);

  return (
    <div className="access-log">
      <h2>Login & Access Logs</h2>
      <table>
        <thead>
          <tr>
            <th>User</th><th>Role</th><th>Action</th><th>IP</th><th>Device</th><th>Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td>{log.userId?.fullName}</td>
              <td>{log.role}</td>
              <td>{log.action}</td>
              <td>{log.ip}</td>
              <td>{log.userAgent}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccessLogViewer;
