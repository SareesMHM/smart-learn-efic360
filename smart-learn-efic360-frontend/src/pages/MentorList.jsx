import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const MentorList = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/mentors');
      setMentors(response.data);
    } catch (error) {
      console.error('Error fetching mentors', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mentor-list">
      <h2>Available Mentors</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {mentors.map((mentor) => (
            <li key={mentor._id}>
              <h3>{mentor.userId.name}</h3>
              <p>{mentor.bio}</p>
              <button onClick={() => window.location.href = `/book-session/${mentor._id}`}>Book Session</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentorList;
