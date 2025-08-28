
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/packages', authenticateToken, async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      include: {
        documents: true,
        checklistItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(packages);
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/packages', authenticateToken, async (req, res) => {
  try {
    const { customerName, propertyAddress, county } = req.body;

    const newPackage = await prisma.package.create({
      data: {
        customerName,
        propertyAddress,
        county,
        status: 'Draft',
        userId: req.user.userId
      },
      include: {
        documents: true,
        checklistItems: true
      }
    });

    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/packages/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedPackage = await prisma.package.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        documents: true,
        checklistItems: true
      }
    });

    res.json(updatedPackage);
  } catch (error) {
    console.error('Update package status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/packages/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;

    const document = await prisma.document.create({
      data: {
        name,
        url,
        packageId: parseInt(id),
        uploaderId: req.user.userId
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
