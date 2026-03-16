const mongoose = require('mongoose');
require('dotenv').config();

const Video = require('./models/Video');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // We are deleting the placeholder video inserted during testing: "7zQXXQkXl5E" and the "1234567890a" one
    await Video.deleteMany({
      youtubeId: { $in: ['7zQXXQkXl5E', '1234567890a'] }
    });
    console.log('Test videos removed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
