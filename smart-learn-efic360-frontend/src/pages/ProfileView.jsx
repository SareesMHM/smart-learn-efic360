import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the student profile
    axios.get('/user/profile')
      .then(response => {
        setProfile(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        navigate('/login'); // Redirect to login if not authenticated
      });
  }, []);

  return (
    <div className="profile-container">
      {profile ? (
        <div className="profile-details">
          <h2>{profile.fullName}'s Profile</h2>
          <div className="profile-image">
            <img src={profile.profileImage || 'default-profile.jpg'} alt="Profile" />
          </div>
          <div className="profile-info">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>NIC:</strong> {profile.nic}</p>
            <p><strong>Phone:</strong> {profile.phone}</p>
            <p><strong>Address:</strong> {profile.address}</p>
            <p><strong>Grade:</strong> {profile.grade}</p>
            <p><strong>Parent Name:</strong> {profile.parentName}</p>
            <p><strong>Parent Phone:</strong> {profile.parentPhone}</p>
          </div>
          <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfileView;
