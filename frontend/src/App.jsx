import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import AdminDashboard from './pages/AdminDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AuthPages from './pages/AuthPages';
import UserHistory from './pages/UserHistory';
import UserBookmarks from './pages/UserBookmarks';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/watch/:id" element={<VideoPlayerPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/mentor" element={<MentorDashboard />} />
            <Route path="/login" element={<AuthPages />} />
            <Route path="/register" element={<AuthPages />} />
            <Route path="/bookmarks" element={<UserBookmarks />} />
            <Route path="/history" element={<UserHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
