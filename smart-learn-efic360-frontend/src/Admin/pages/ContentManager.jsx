// src/pages/ContentManager.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const ContentManager = () => {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({ title: '', type: 'video', description: '', file: null, link: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await axios.get('/api/materials');
    setMaterials(res.data);
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
        if (formData[key]) data.append(key, formData[key]);
      }
      await axios.post('/api/materials', data);
      setMessage('Material uploaded successfully.');
      fetchMaterials();
    } catch {
      setMessage('Upload failed.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this material?')) {
      await axios.delete(`/api/materials/${id}`);
      fetchMaterials();
    }
  };

  return (
    <div className="content-manager">
      <h2>Content Management</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <select name="type" onChange={handleChange}>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="assignment">Assignment</option>
          <option value="notes">Notes</option>
          <option value="link">Link</option>
        </select>
        <textarea name="description" placeholder="Description" onChange={handleChange} rows={3} />
        {formData.type === 'link' ? (
          <input name="link" placeholder="Paste link" onChange={handleChange} />
        ) : (
          <input name="file" type="file" onChange={handleChange} accept="*" />
        )}
        <button type="submit">Upload</button>
      </form>

      <h3>Uploaded Materials</h3>
      <ul>
        {materials.map(mat => (
          <li key={mat._id}>
            <strong>{mat.title}</strong> ({mat.type}) - {mat.description}<br />
            {mat.link ? <a href={mat.link} target="_blank" rel="noopener noreferrer">Open</a> : <a href={`/uploads/${mat.file}`} target="_blank">View File</a>}
            <button onClick={() => handleDelete(mat._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContentManager;
