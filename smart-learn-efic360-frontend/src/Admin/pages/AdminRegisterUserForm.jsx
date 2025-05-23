// AdminRegisterUserForm.jsx
import { useState } from 'react';
import adminService from "../services/adminService";
import { useNavigate } from 'react-router-dom'; 

const AdminRegisterUserForm = () => {


  const [role, setRole] = useState('student');
  // const [formData, setFormData] = useState({});

  
  const [message, setMessage] = useState('');
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
      postalCode: '',
      subject: '',
    qualifications: '',
    childrenName: '',
    work: '',
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
        navigate('/AdminRegisterUserForm',{
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
       phone, parentName, parentPhone, gradeId ,address,subject,qualifications,childrenName,work
    } = formData;

    if (!fullName || !email || !password || !confirmPassword || !parentnic || !dateOfBirth ||
         !phone || !parentName || !parentPhone || !gradeId || !gender ||
        !address.number || !address.street || !address.city || !address.district || !address.postalCode || !subject || !qualifications || !childrenName || !work) {
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
            data.append(`address.${addrKey}`, addrValue); // use dot notation
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

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({});
  };

 

  return (
    <div className="registration-container">
      <h3>Register {role.charAt(0).toUpperCase() + role.slice(1)}</h3>
      {message && <p>{message}</p>}

      <label>Role:
        <select value={role} onChange={handleRoleChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
      </label>

      <form onSubmit={handleSubmit} encType="multipart/form-data"noValidate>
        <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
        <input name="phone" placeholder="Contact Number" onChange={handleChange} required />
        <input name="dateOfBirth" type="date" onChange={handleChange} required />

        {role === 'student' && (
          <input name="parentnic" placeholder="Parent NIC" onChange={handleChange} required />
        )}

        {role === 'teacher' && (
          <input name="nic" placeholder="NIC" onChange={handleChange} required />
        )}

        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={formData.gender || ''} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        
        

        
        <input name="address.number" placeholder="Address Number"type="text" value={formData.address?.number || ''} onChange={handleChange} required />

        
        <input name="address.street" placeholder="Street"type="text" value={formData.address?.street || ''} onChange={handleChange} required />

       
        <input name="address.city" placeholder="City"type="text" value={formData.address?.city || ''} onChange={handleChange} required />

        
        <input name="address.district" placeholder="District"type="text" value={formData.address?.district || ''} onChange={handleChange} required />

        
        <input name="address.postalCode" placeholder="Postal Code"type="number" value={formData.address?.postalCode || ''} onChange={handleChange} required />

        <input name="profileImage" type="file" onChange={handleChange} accept="image/*" />

        {role === 'teacher' && (
          <>
          
            <input name="subject" placeholder="Subject" onChange={handleChange} required />
            <input name="qualifications" placeholder="Qualifications" onChange={handleChange} required />
          </>
        )}

        {role === 'parent' && (
          <>
          
            <input name="parentnic" placeholder="NIC" onChange={handleChange} required />
            <input name="childrenName" placeholder="Children Name" onChange={handleChange} required />
            <input name="work" placeholder="Work" onChange={handleChange} required />
          </>
        )}

        {role === 'student' && (
          <>
            <input name="parentName" placeholder="Parent Name" onChange={handleChange} required />
            
            <label htmlFor="gradeId">Grade</label>
            <select id="gradeId" name="gradeId" value={formData.gradeId || ''} onChange={handleChange} required>
              <option value="">Select Grade</option>
              {[...Array(13)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{`Grade ${i + 1}`}</option>
              ))}
            </select>
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
