import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    parentnic: '',
    dateOfBirth: '',
   
    phone: '',
    parentName: '',
    parentPhone: '',
    gradeId: '',
    confirmPassword: '',
    profileImage: null,
    role: 'student',
    gender: '',
    address: {
      number: '',
      street: '',
      city: '',
      district: '',
      postalCode: ''
    }
  });
  

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (data) => register(data),
    onSuccess: (data) => {
      alert('Registration successful!');
      if (data.role === 'admin') {
        alert('Admin registered successfully. Redirecting to Admin Dashboard...');
        navigate('/admin');
      } else {
        alert('Registration successful. Please verify your email.');
        navigate('/SendVerification',{
          state:{
            user:data
          }
        });
      }
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

     if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [key]: value
        }
      }));
    } else if (name === 'profileImage' && files) {
      setFormData((prev) => ({ ...prev, profileImage: files[0] }));
    } else if (name === 'gradeId') {
      setFormData((prev) => ({ ...prev, gradeId: value === '' ? '' : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const {
      fullName, email, password, confirmPassword, parentnic, dateOfBirth,
       phone, parentName, parentPhone, gradeId ,address
    } = formData;

    if (!fullName || !email || !password || !confirmPassword || !parentnic || !dateOfBirth ||
         !phone || !parentName || !parentPhone || !gradeId || !gender ||
        !address.number || !address.street || !address.city || !address.district || !address.postalCode) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

  try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'address' && typeof value === 'object') {
          Object.entries(value).forEach(([addrKey, addrValue]) => {
            data.append(`address.${addrKey}`, addrValue); // ✅ use dot notation
          });
        } else if (value !== null && value !== undefined) {
          if (key === 'profileImage' && value instanceof File) {
            data.append(key, value);
          } else {
            data.append(key, value.toString());
          }
        }
      });


      mutation.mutate(data);

      
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Email already registered.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        <label htmlFor="fullName">Full Name</label>
        <input id="fullName" name="fullName" type="text" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required />

        <label htmlFor="email">Email Address</label>
        <input id="email" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={formData.password} onChange={handleChange} required minLength={6} />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required minLength={6} />

        {/* <button type="button" onClick={() => setShowPassword(!showPassword)} className="toggle-password">
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button> */}

        <label htmlFor="parentnic">Parent's Nic</label>
        <input id="parentnic" name="parentnic" type="text" placeholder="parentnic" value={formData.nic} onChange={handleChange} required />

        <label htmlFor="dateOfBirth">Date of Birth</label>
        <input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />

         <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          
        </select>

         <label>Address Number</label>
        <input name="address.number" type="text" value={formData.address.number} onChange={handleChange} required />

        <label>Street</label>
        <input name="address.street" type="text" value={formData.address.street} onChange={handleChange} required />

        <label>City</label>
        <input name="address.city" type="text" value={formData.address.city} onChange={handleChange} required />

        <label>District</label>
        <input name="address.district" type="text" value={formData.address.district} onChange={handleChange} required />

        <label>Postal Code</label>
        <input name="address.postalCode" type="number" value={formData.address.postalCode} onChange={handleChange} required />


        

        <label htmlFor="phone">Phone Number</label>
        <input id="phone" name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />

        <label htmlFor="parentName">Parent/Guardian Name</label>
        <input id="parentName" name="parentName" type="text" placeholder="Parent/Guardian Name" value={formData.parentName} onChange={handleChange} required />

        <label htmlFor="parentPhone">Parent/Guardian Phone</label>
        <input id="parentPhone" name="parentPhone" type="tel" placeholder="Parent/Guardian Phone" value={formData.parentPhone} onChange={handleChange} required />

        <label htmlFor="gradeId">Grade</label>
        <select id="gradeId" name="gradeId" value={formData.gradeId} onChange={handleChange} required>
          <option value="">Select Grade</option>
          {[...Array(13)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{`Grade ${i + 1}`}</option>
          ))}
        </select>

        <label htmlFor="profileImage">Upload Profile Image</label>
        <input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleChange} />

        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange} disabled>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading}   onClick={handleSubmit}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default RegistrationPage;
