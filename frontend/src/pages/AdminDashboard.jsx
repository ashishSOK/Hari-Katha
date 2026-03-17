import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
  });
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState(['Kirtan', 'Vaishnava Songs', 'Lectures', 'Bhagavad Gita', 'Other']);

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.get(`${apiUrl}/api/videos/categories`);
      setCategories(data);
      if (data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: data[0] }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getToken = () => {
    let rawToken = localStorage.getItem('token');
    if (rawToken === 'undefined' || rawToken === 'null') rawToken = null;
    if (!rawToken) {
      try {
        const uInfo = JSON.parse(localStorage.getItem('userInfo'));
        rawToken = uInfo?.token;
      } catch (e) {}
    }
    return rawToken;
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) throw new Error('You are not logged in. Please log in to upload videos.');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/videos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Video added successfully!');
      setFormData({ title: '', url: '', description: '', category: categories.length > 0 ? categories[0] : 'Kirtan' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding video');
    }
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container fade-in">
        <h1 className="admin-title">Upload Video</h1>
        <p className="admin-subtitle">Curate spiritual content for the community.</p>

        <form onSubmit={handleSubmit} className="admin-form">
          {message && <div className={`admin-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

          <div className="form-group">
            <label>Video Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>YouTube URL</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={e => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {(categories || []).filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <button type="submit" className="admin-btn">Add Video</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
