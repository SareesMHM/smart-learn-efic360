import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Loader from '../components/Loader';

// Make sure you have this

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/getProfile')
      .then(response => {
        setProfile(response.data.user);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        navigate('/login'); // Redirect to login if unauthorized
      });
  }, [navigate]);

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-details">
        <h2>{profile.fullName}'s Profile</h2>
        <div className="profile-image">
          <img
            src={profile.profileImage || '/default-profile.jpg'}
            alt="Profile"
            style={{ width: '150px', borderRadius: '50%' }}
          />
        </div>

        <div className="profile-info">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>NIC:</strong> {profile.nic || profile.parentnic}</p>
         
          <p><strong>Address:</strong> {
            profile.address ? `${profile.address.number}, ${profile.address.street}, ${profile.address.city}, ${profile.address.district}, ${profile.address.postalCode}` : 'N/A'
          }</p>
          <p><strong>Grade:</strong> {profile.gradeId ? `Grade ${profile.gradeId}` : 'N/A'}</p>
          <p><strong>Parent Name:</strong> {profile.parentName}</p>
          <p><strong>Parent Phone:</strong> {profile.parentPhone}</p>
        </div>

        <button onClick={() => navigate('/ProfileEdit')}>Edit Profile</button>
      </div>
    </div>
  );
};

export default ProfileView;
