
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const router = express.Router();

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'User' } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.status(201).json({
      user,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
