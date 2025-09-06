import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const ROLES = ['All', 'Student', 'Teacher', 'Parent', 'Admin'];
const STATUSES = ['Open', 'In Progress', 'Resolved'];

const Feedback = () => {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Other');
  const [feedbacks, setFeedbacks] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [statusMsg, setStatusMsg] = useState('');
  const [tab, setTab] = useState('all'); // 'all' | 'mine'

  // If you store role in localStorage after login:
  const currentUserRole = localStorage.getItem('role') || '';
  const canUpdateStatus = currentUserRole === 'Admin';

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const fetchFeedbacks = async () => {
    try {
      const params = {};
      if (tab === 'all') {
        if (roleFilter !== 'All') params.role = roleFilter;
        if (userFilter !== 'All') params.userId = userFilter;
      }
      const url = tab === 'mine' ? '/api/feedback/mine' : '/api/feedback/all';
      const res = await axios.get(url, { ...authHeader(), params });
      setFeedbacks(Array.isArray(res.data.feedbacks) ? res.data.feedbacks : []);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback/submit', { message, category }, authHeader());
      setMessage('');
      setCategory('Other');
      setStatusMsg('✅ Feedback submitted!');
      fetchFeedbacks();
      setTimeout(() => setStatusMsg(''), 2000);
    } catch (err) {
      console.error(err);
      setStatusMsg('❌ Could not submit feedback.');
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await axios.patch(`/api/feedback/${feedbackId}`, { status: newStatus }, authHeader());
      setStatusMsg('✅ Status updated');
      fetchFeedbacks();
      setTimeout(() => setStatusMsg(''), 1500);
    } catch (err) {
      console.error(err);
      setStatusMsg('❌ Update failed (need Admin?)');
      setTimeout(() => setStatusMsg(''), 2500);
    }
  };

  // Build the "User" filter list from current results (All tab)
  const userOptions = useMemo(() => {
    const seen = new Map();
    feedbacks.forEach(f => {
      const u = f.user;
      if (u?.id && !seen.has(u.id)) seen.set(u.id, `${u.name} (${u.role})`);
    });
    return [['All', 'All'], ...Array.from(seen.entries())]; // [[value,label], ...]
  }, [feedbacks]);

  useEffect(() => { fetchFeedbacks(); /* eslint-disable-next-line */ }, [tab, roleFilter, userFilter]);

  const resetFilters = () => {
    setRoleFilter('All');
    setUserFilter('All');
  };

  const onUserClick = (u) => {
    if (!u?.id) return;
    setTab('all');
    setUserFilter(u.id);
  };

  return (
    <div className="feedback-container">
      <h2>Submit Feedback</h2>

      {/* Tabs */}
      <div className="tabs" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setTab('all')}
          style={{ fontWeight: tab === 'all' ? '700' : '400' }}
        >
          All feedback
        </button>
        <button
          type="button"
          onClick={() => { setTab('mine'); resetFilters(); }}
          style={{ fontWeight: tab === 'mine' ? '700' : '400' }}
        >
          My feedback
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your feedback..."
          required
        />
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Bug">Bug</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Complaint">Complaint</option>
            <option value="Other">Other</option>
          </select>

          {/* Filters only shown on 'All' tab */}
          {tab === 'all' && (
            <>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                {userOptions.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>

              <button type="button" onClick={resetFilters}>Reset</button>
            </>
          )}
        </div>

        <button type="submit">Submit</button>
        {statusMsg && <p>{statusMsg}</p>}
      </form>

      <h3 style={{ marginTop: 16 }}>{tab === 'mine' ? 'My Feedback' : 'All Feedback'}</h3>
      {Array.isArray(feedbacks) && feedbacks.length === 0 ? (
        <p>No feedback found.</p>
      ) : (
        <ul>
          {feedbacks.map((fb) => (
            <li key={fb._id} style={{ marginBottom: 12 }}>
              <strong>{fb.category}</strong>: {fb.message}
              <br />
              <small>
                By:{' '}
                {fb.user?.name ? (
                  <button
                    type="button"
                    onClick={() => onUserClick(fb.user)}
                    title="Show this user's feedback"
                    style={{ textDecoration: 'underline', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    {fb.user.name}
                  </button>
                ) : 'Unknown'}{' '}
                ({fb.user?.role ?? '—'})
                {' • '}Status:{' '}
                {(tab === 'all' && canUpdateStatus) ? (
                  <select
                    value={fb.status ?? 'Open'}
                    onChange={(e) => handleStatusChange(fb._id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <span>{fb.status ?? 'Open'}</span>
                )}
                {fb.createdAt ? ` • ${new Date(fb.createdAt).toLocaleString()}` : ''}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feedback;
