// AdminRegisterUserForm.jsx
import { useState } from 'react';
import adminService from "../services/adminService";


const AdminRegisterUserForm = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }
      data.append('role', role);
      await adminService.addUser(data);
      setMessage(`✅ ${role} registered successfully.`);
    } catch (err) {
      setMessage('❌ Registration failed.');
    }
  };

  return (
    <div>
      <h3>Register {role.charAt(0).toUpperCase() + role.slice(1)}</h3>
      {message && <p>{message}</p>}

      <label>Role:
        <select value={role} onChange={handleRoleChange}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
        </select>
      </label>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {(role === 'student' || role === 'teacher' || role === 'parent') && (
          <>
            <input name="fullName" placeholder="Full Name" onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            <input name="nic" placeholder="NIC" onChange={handleChange} required />
            <input name="dateOfBirth" type="date" onChange={handleChange} required />
            <input name="address" placeholder="Address" onChange={handleChange} required />
            <input name="phone" placeholder="Contact Number" onChange={handleChange} required />
            <input name="gender" placeholder="Gender" onChange={handleChange} required />
            <input name="profileImage" type="file" onChange={handleChange} accept="image/*" />
          </>
        )}

        {role === 'teacher' && (
          <>
            <input name="subject" placeholder="Subject" onChange={handleChange} required />
            <input name="qualifications" placeholder="Qualifications" onChange={handleChange} required />
          </>
        )}

        {role === 'parent' && (
          <>
            <input name="childrenName" placeholder="Children Name" onChange={handleChange} required />
            <input name="work" placeholder="Work" onChange={handleChange} required />
          </>
        )}

        {role === 'student' && (
          <>
            <input name="parentName" placeholder="Parent Name" onChange={handleChange} required />
            <input name="parentPhone" placeholder="Parent Phone" onChange={handleChange} required />
            <input name="gradeId" placeholder="Grade ID" onChange={handleChange} required />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
          </>
        )}

        <button type="submit">Register {role}</button>
      </form>
    </div>
  );
};

export default AdminRegisterUserForm;
