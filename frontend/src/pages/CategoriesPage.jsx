import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import { FaPlus, FaBook, FaMusic, FaMicrophoneAlt, FaGlobe, FaListUl, FaTimes } from 'react-icons/fa';
import './CategoriesPage.css';

const SYSTEM_CATEGORIES = ['Bhagavad Gita', 'Kirtan', 'Lectures', 'Other', 'Vaishnava Songs'];

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const { data } = await axios.get(`${apiUrl}/api/videos/categories`);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getToken = () => {
    let token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
      try {
        token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      } catch (e) {}
    }
    return token;
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const token = getToken();
      if (!token) throw new Error('Not logged in.');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.post(`${apiUrl}/api/videos/categories`, { name: newCategoryName.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`✓ Category "${newCategoryName.trim()}" added!`);
      setNewCategoryName('');
      setShowForm(false);
      await fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error adding category');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const confirmDelete = (catName) => {
    setCategoryToDelete(catName);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not logged in.');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.delete(`${apiUrl}/api/videos/categories/${encodeURIComponent(categoryToDelete)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`✓ Category "${categoryToDelete}" deleted!`);
      await fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting category');
    }
    setLoading(false);
    setCategoryToDelete(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const systemCats = categories.filter(c => SYSTEM_CATEGORIES.includes(c));
  const customCats = categories.filter(c => !SYSTEM_CATEGORIES.includes(c));

  const getCategoryIcon = (catName) => {
    const norm = catName.toLowerCase();
    if (norm.includes('gita') || norm.includes('book')) return <FaBook className="category-icon" />;
    if (norm.includes('kirtan') || norm.includes('song') || norm.includes('bhajan')) return <FaMusic className="category-icon" />;
    if (norm.includes('lecture') || norm.includes('katha') || norm.includes('class')) return <FaMicrophoneAlt className="category-icon" />;
    if (norm.includes('other')) return <FaGlobe className="category-icon" />;
    return <FaListUl className="category-icon" />;
  };

  return (
    <div className="categories-page">
      <Navbar />
      <div className="categories-container container">

        <div className="categories-header">
          <div>
            <h1 className="categories-title">Categories</h1>
            <p className="categories-subtitle">Browse and manage content categories.</p>
          </div>
          <div className="add-category-section">
            {!showForm ? (
              <button className="add-category-btn-large" onClick={() => setShowForm(true)}>
                <FaPlus /> Add Category
              </button>
            ) : (
              <form onSubmit={handleAddCategory} className="add-category-form-large">
                <input
                  className="add-category-input-large"
                  type="text"
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  autoFocus
                  required
                />
                <button
                  type="submit"
                  className="add-category-btn-large"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  disabled={loading}
                >
                  {loading ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewCategoryName(''); }}
                  style={{
                    padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '100px', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {message && (
          <div className={`categories-msg ${message.startsWith('✓') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {/* System Categories */}
        <div className="categories-group">
          <h2 className="group-title">Default Categories</h2>
          <div className="categories-grid">
            {systemCats.map(cat => (
              <div key={cat} className="category-card system-card">
                {getCategoryIcon(cat)}
                <span className="category-name">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Categories */}
        {customCats.length > 0 && (
          <div className="categories-group">
            <h2 className="group-title">Custom Categories</h2>
            <div className="categories-grid">
              {customCats.map(cat => (
                <div key={cat} className="category-card custom-card">
                  <button 
                    className="delete-cat-btn" 
                    onClick={() => confirmDelete(cat)}
                    title="Delete Category"
                    disabled={loading}
                  >
                    <FaTimes />
                  </button>
                  {getCategoryIcon(cat)}
                  <span className="category-name">{cat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {customCats.length === 0 && (
          <p className="no-categories">No custom categories yet. Add one above!</p>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="delete-modal-overlay fade-in">
          <div className="delete-modal-content">
            <h3>Delete Category?</h3>
            <p>Are you sure you want to permanently delete <strong>"{categoryToDelete}"</strong>?</p>
            <div className="delete-modal-actions">
              <button 
                className="cancel-btn rounded-btn" 
                onClick={() => setCategoryToDelete(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-btn rounded-btn" 
                onClick={handleDeleteCategory}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesPage;
