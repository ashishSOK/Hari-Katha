import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Kirtan',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Use VITE_API_URL from environment or fallback to localhost for local dev
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/videos`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Video added successfully!');
      setFormData({ title: '', url: '', description: '', category: 'Kirtan' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding video');
    }
  };

  return (
    <div className="admin-page">
      <Navbar />
      <div className="container admin-container fade-in">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Curate spiritual content for the community.</p>
        
        <form onSubmit={handleSubmit} className="admin-form">
          {message && <div className={`admin-msg ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          
          <div className="form-group">
            <label>Video Title</label>
            <input 
              type="text" 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          <div className="form-group">
            <label>YouTube URL</label>
            <input 
              type="url" 
              required
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})} 
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Kirtan">Kirtan</option>
              <option value="Vaishnava Songs">Vaishnava Songs</option>
              <option value="Lectures">Lectures</option>
              <option value="Bhagavad Gita">Bhagavad Gita</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            ></textarea>
          </div>
          
          <button type="submit" className="admin-btn">Add Video</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
