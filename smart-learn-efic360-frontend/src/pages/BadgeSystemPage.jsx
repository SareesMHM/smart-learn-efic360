import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

import { FaTrophy, FaMedal, FaStar } from 'react-icons/fa';

const BadgeSystemPage = () => {
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    // Fetch badges and rewards data
    fetchBadgesAndRewards();
  }, []);

  const fetchBadgesAndRewards = async () => {
    try {
      const res = await axios.get('/api/badges'); // Backend API for badges
      setBadges(res.data.badges);

      const rewardsRes = await axios.get('/api/rewards'); // Backend API for rewards
      setRewards(rewardsRes.data.rewards);
    } catch (err) {
      console.error('Error fetching badges and rewards', err);
    }
  };

  return (
    <div className="badge-system-page">
      <Helmet>
        <title>Badge & Reward System | Smart Learn EFIC 360</title>
      </Helmet>
      
      <div className="header">
        <h2>Badge & Reward System</h2>
        <p>Earn badges and rewards based on your achievements!</p>
      </div>

      <div className="badges">
        <h3>Your Badges</h3>
        <div className="badge-list">
          {badges.length > 0 ? (
            badges.map((badge) => (
              <div key={badge.id} className="badge">
                <FaTrophy className="badge-icon" />
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
              </div>
            ))
          ) : (
            <p>No badges earned yet.</p>
          )}
        </div>
      </div>

      <div className="rewards">
        <h3>Your Rewards</h3>
        <div className="reward-list">
          {rewards.length > 0 ? (
            rewards.map((reward) => (
              <div key={reward.id} className="reward">
                <FaMedal className="reward-icon" />
                <h4>{reward.name}</h4>
                <p>{reward.description}</p>
                <p>Points: {reward.points}</p>
              </div>
            ))
          ) : (
            <p>No rewards yet. Complete achievements to earn rewards!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgeSystemPage;
