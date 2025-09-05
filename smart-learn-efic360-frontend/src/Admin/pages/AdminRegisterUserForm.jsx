import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';

const AdminRegisterUserForm = () => {
  const initialFormData = {
    role: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentnic: '',
    nic: '',
    dateOfBirth: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    gradeId: '',
    gender: '',
    address: {
      number: '',
      street: '',
      city: '',
      district: '',
      postalCode: '',
    },
    
    qualifications: '',
    childrenName: '',
    work: '',
    profileImage: null,
  };

  const [role, setRole] = useState('');
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data) => register(data),
    onSuccess: (data) => {
      alert('Registration successful!');
      if (data.role === 'admin') {
        alert('Admin registered successfully. Redirecting to Admin Dashboard...');
        navigate('/Admin/AdminRegisterUserForm');
      } else {
        alert('Registration successful. Please verify your email.');
        navigate('/Admin/AdminRegisterUserForm', { state: { user: data } });
      }
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Registration failed.');
    },
  });

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setFormData({ ...initialFormData, role: selectedRole });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'role') {
      setRole(value);
      setFormData((prev) => ({ ...prev, role: value }));
    } else if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
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
      role,
      fullName,
      email,
      password,
      confirmPassword,
      parentnic,
      nic,
      dateOfBirth,
      phone,
      parentName,
      parentPhone,
      gradeId,
      gender,
      address,
     
      qualifications,
      childrenName,
      work,
    } = formData;
    console.log(formData)

    // Validate required fields depending on role
    if (
      !role ||
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !dateOfBirth ||
      !gender ||
      !address.number ||
      !address.street ||
      !address.city ||
      !address.district ||
      !address.postalCode ||
      (role === 'student' && (!parentnic || !parentPhone || !parentName || !gradeId)) ||
      (role === 'teacher' && (!phone || !nic  || !qualifications)) ||
      (role === 'parent' && (!parentName || !parentPhone || !parentnic || !childrenName || !work))
    ) {
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
            data.append(`address.${addrKey}`, addrValue);
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
      <h3>Register {role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}</h3>
      {error && <p className="error-message">{error}</p>}

      <label>
        Role:
        <select value={role} onChange={handleRoleChange} required>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
      </label>

      <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
       
        <input
          name="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />

        

        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input
          name="address.number"
          placeholder="Address Number"
          type="text"
          value={formData.address.number}
          onChange={handleChange}
          required
        />
        <input
          name="address.street"
          placeholder="Street"
          type="text"
          value={formData.address.street}
          onChange={handleChange}
          required
        />
        <input
          name="address.city"
          placeholder="City"
          type="text"
          value={formData.address.city}
          onChange={handleChange}
          required
        />
        <input
          name="address.district"
          placeholder="District"
          type="text"
          value={formData.address.district}
          onChange={handleChange}
          required
        />
        <input
          name="address.postalCode"
          placeholder="Postal Code"
          type="number"
          value={formData.address.postalCode}
          onChange={handleChange}
          required
        />

        <input
          name="profileImage"
          type="file"
          onChange={handleChange}
          accept="image/*"
        />
        {role === 'student' && (
          <>
            <input
              name="parentnic"
              placeholder="Parent NIC"
              value={formData.parentnic}
              onChange={handleChange}
              required
            />
            <input
              name="parentPhone"
              placeholder="Parent Phone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
            />
            <input
              name="parentName"
              placeholder="Parent Name"
              value={formData.parentName}
              onChange={handleChange}
              required
            />
            <label htmlFor="gradeId">Grade</label>
            <select
              id="gradeId"
              name="gradeId"
              value={formData.gradeId}
              onChange={handleChange}
              required
            >
              <option value="">Select Grade</option>
              {[...Array(13)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{`Grade ${i + 1}`}</option>
              ))}
            </select>
          </>
        )}

        {role === 'teacher' && (
          <>
          <input
            name="nic"
            placeholder="NIC"
            value={formData.nic}
            onChange={handleChange}
            required
          />
           <input
          name="phone"
          placeholder="Contact Number"
          value={formData.phone}
          onChange={handleChange}
         
        />
        
            <input
              name="qualifications"
              placeholder="Qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              required
            />
        </>
        )}

        

        {role === 'parent' && (
          <>
            <input
              name="parentName"
              placeholder="Parent Name"
              value={formData.parentName}
              onChange={handleChange}
              required
            />
            <input
              name="parentnic"
              placeholder="NIC"
              value={formData.parentnic}
              onChange={handleChange}
              required
            />
            <input
              name="parentPhone"
              placeholder="Parent Phone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
            />
            <input
              name="childrenName"
              placeholder="Children Name"
              value={formData.childrenName}
              onChange={handleChange}
              required
            />
            <input
              name="work"
              placeholder="Work"
              value={formData.work}
              onChange={handleChange}
              required
            />
          </>
        )}


        <button type="submit" disabled={loading}   onClick={handleSubmit}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default AdminRegisterUserForm;
