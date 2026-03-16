const fetch = require('node-fetch');
const mongoose = require('mongoose');

async function testBackend() {
  try {
    // 1. Register User
    console.log('Registering user...');
    const regRes = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin_test', password: 'password123' })
    });
    
    // Ignore error if already exists
    if (!regRes.ok) console.log('User might already exist:', await regRes.text());

    // 2. Make admin via Mongoose
    console.log('Connecting to DB to make admin...');
    await mongoose.connect('mongodb://localhost:27017/harikatha');
    await mongoose.connection.db.collection('users').updateOne(
      { username: 'admin_test' },
      { $set: { isAdmin: true } }
    );
    console.log('User is now admin.');

    // 3. Login
    console.log('Logging in...');
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin_test', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token received:', !!token);

    // 4. Create Video
    console.log('Creating video...');
    const vidRes = await fetch('http://localhost:5001/api/videos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Beautiful Krishna Kirtan',
        url: 'https://www.youtube.com/watch?v=7zQXXQkXl5E',
        description: 'Immersive and divine Kirtan.',
        category: 'Kirtan',
        duration: '10:00'
      })
    });
    const vidData = await vidRes.json();
    console.log('Video created:', vidData);
    
    // 5. Clean up
    await mongoose.connection.close();
    console.log('Done.');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testBackend();
