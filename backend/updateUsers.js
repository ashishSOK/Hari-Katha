const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    await User.updateMany({}, { role: 'mentor', isAdmin: true });
    console.log('All users updated to mentor & admin!');
    process.exit(0);
  });
