import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Loader from '../components/Loader'; // Make sure this exists

const ProfileEdit = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    nic: '',
    
    address: {
      number: '',
      street: '',
      city: '',
      district: '',
      postalCode: ''
    },
    gradeId: '',
    parentName: '',
    parentPhone: '',
    profileImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/getProfile')
      .then(response => {
        setProfile(response.data.user);
        if (response.data.user?.profileImage) {
          setImagePreview(response.data.user.profileImage);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        navigate('/login');
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value
        }
      }));
    } else if (name === 'profileImage' && files?.length) {
      setProfile(prev => ({ ...prev, profileImage: files[0] }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();

    Object.entries(profile).forEach(([key, value]) => {
      if (key === 'address' && typeof value === 'object') {
        Object.entries(value).forEach(([addrKey, addrValue]) => {
          formData.append(`address.${addrKey}`, addrValue);
        });
      } else if (key === 'profileImage' && value instanceof File) {
        formData.append('profileImage', value);
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.put('/updateProfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // navigate('/profile');
    } catch (err) {
      setError('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="profile-edit-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">

        <label>Full Name</label>
        <input name="fullName" value={profile.fullName} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" type="email" value={profile.email} onChange={handleChange} required />

        <label>NIC</label>
        <input name="parentnic" value={profile.parentnic} onChange={handleChange} required />

       
        <label>Address Number</label>
        <input name="address.number" value={profile.address.number} onChange={handleChange} required />

        <label>Street</label>
        <input name="address.street" value={profile.address.street} onChange={handleChange} required />

        <label>City</label>
        <input name="address.city" value={profile.address.city} onChange={handleChange} required />

        <label>District</label>
        <input name="address.district" value={profile.address.district} onChange={handleChange} required />

        <label>Postal Code</label>
        <input name="address.postalCode" type="number" value={profile.address.postalCode} onChange={handleChange} required />

        <label>Grade</label>
        <select name="gradeId" value={profile.gradeId} onChange={handleChange} required>
          <option value="">Select Grade</option>
          {[...Array(13)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{`Grade ${i + 1}`}</option>
          ))}
        </select>

        <label>Parent Name</label>
        <input name="parentName" value={profile.parentName} onChange={handleChange} />

        <label>Parent Phone</label>
        <input name="parentPhone" type="tel" value={profile.parentPhone} onChange={handleChange} />

        <label>Profile Image</label>
        <input name="profileImage" type="file" accept="image/*" onChange={handleChange} />
        {imagePreview && <img src={imagePreview} alt="Preview" width="120" style={{ marginTop: '10px', borderRadius: '10px' }} />}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default ProfileEdit;
