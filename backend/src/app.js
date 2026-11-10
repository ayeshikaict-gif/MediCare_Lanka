const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { seedData } = require('./db/seed');
const apiRoutes = require('./routes/api');

const app = express();

// Enable CORS for frontend origin
app.use(cors());

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy one-time schema & seed initialization (supports both local and serverless cold starts)
let initPromise = null;
const ensureInitialized = () => {
  if (!initPromise) {
    initPromise = seedData().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
};

app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
    next();
  } catch (err) {
    console.error('Database initialization error:', err);
    res.status(500).json({ success: false, message: 'Database initialization failed.' });
  }
});

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MediCare Lanka API', timestamp: new Date().toISOString() });
});

// Serve frontend static build when available (local production mode)
if (!process.env.VERCEL) {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') {
        return next();
      }
      const indexPath = path.join(frontendDistPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      next();
    });
  }
}

app.ensureInitialized = ensureInitialized;

module.exports = app;
