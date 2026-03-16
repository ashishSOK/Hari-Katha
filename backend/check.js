const mongoose = require('mongoose');
const Video = require('./models/Video');
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/harikatha');
Video.find({ title: { $regex: 'Vaishnava song' } }).then(docs => {
  console.log(docs);
  process.exit(0);
});
