// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT payload
    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d', // Token valid for 1 day
    });

    // Respond with token and user info (exclude password)
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
