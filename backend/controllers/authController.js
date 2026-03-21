const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { username, password, role, isMentorKey, mentorId } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine actual role
    let finalRole = 'member';
    if (role === 'mentor') {
      if (isMentorKey === 'mentor123') {
        finalRole = 'mentor';
      } else {
        return res.status(401).json({ message: 'Invalid Mentor Authorization Key' });
      }
    }

    // Validate mentorId if provided (members linking to a mentor at signup)
    let finalMentorId = null;
    if (finalRole === 'member' && mentorId) {
      const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
      if (!mentor) {
        return res.status(404).json({ message: 'Selected mentor not found' });
      }
      finalMentorId = mentor._id;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: finalRole,
      mentorId: finalMentorId,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        role: user.role,
        isAdmin: user.isAdmin,
        mentorId: user.mentorId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        role: user.role,
        isAdmin: user.isAdmin,
        mentorId: user.mentorId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
