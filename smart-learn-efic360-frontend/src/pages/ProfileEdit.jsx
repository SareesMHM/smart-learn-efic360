import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    nic: '',
    phone: '',
    address: '',
    grade: '',
    parentName: '',
    parentPhone: '',
    profileImage: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current profile details
    axios.get('/user/profile')
      .then(response => {
        setProfile(response.data.user);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        navigate('/login'); // Redirect to login if not authenticated
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profileImage' && files) {
      setProfile((prev) => ({ ...prev, profileImage: files[0] }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!profile.fullName || !profile.email || !profile.nic || !profile.phone) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    Object.entries(profile).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    try {
      await axios.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      navigate('/profile'); // Redirect to profile view after saving
    } catch (err) {
      setError('Error saving profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={profile.fullName}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={profile.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="nic">NIC</label>
        <input
          id="nic"
          name="nic"
          type="text"
          value={profile.nic}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={profile.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          value={profile.address}
          onChange={handleChange}
          required
        />

        <label htmlFor="grade">Grade</label>
        <input
          id="grade"
          name="grade"
          type="text"
          value={profile.grade}
          onChange={handleChange}
        />

        <label htmlFor="parentName">Parent/Guardian Name</label>
        <input
          id="parentName"
          name="parentName"
          type="text"
          value={profile.parentName}
          onChange={handleChange}
        />

        <label htmlFor="parentPhone">Parent/Guardian Phone</label>
        <input
          id="parentPhone"
          name="parentPhone"
          type="tel"
          value={profile.parentPhone}
          onChange={handleChange}
        />

        <label htmlFor="profileImage">Upload Profile Image</label>
        <input
          id="profileImage"
          name="profileImage"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ProfileEdit;
