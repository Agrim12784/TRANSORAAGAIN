const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const rateLimit  = require('express-rate-limit');

// ── Load env ──────────────────────────────────────────────────────────────────
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Rate limiting (brute-force protection) ───────────────────────────────────
const authLimiter = rateLimit({
  windowMs : 15 * 60 * 1000, // 15 minutes
  max      : 20,              // limit each IP to 20 auth requests
  message  : { success: false, message: 'Too many requests. Please try again later.' }
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin      : process.env.FRONTEND_URL || '*',
  credentials : true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success : true,
    message : '🤟 Transora API is running',
    version : '1.0.0',
    status  : 'healthy'
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success : false,
    message : err.message || 'Internal server error'
  });
});

// ── Connect to MongoDB then start server ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Transora server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
