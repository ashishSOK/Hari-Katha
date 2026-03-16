#!/bin/bash
echo "Registering..."
RES=$(curl -s -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"username": "admin", "password": "password"}')
echo $RES

echo "Making admin..."
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/harikatha').then(async () => {
  await mongoose.connection.db.collection('users').updateOne({ username: 'admin' }, { \$set: { isAdmin: true } });
  console.log('Admin set');
  process.exit(0);
});
"

echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"username": "admin", "password": "password"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo "Creating video..."
curl -s -X POST http://localhost:5000/api/videos -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{
  "title": "Beautiful Kirtan",
  "url": "https://www.youtube.com/watch?v=1234567890a",
  "category": "Kirtan"
}' | grep -o 'title'
