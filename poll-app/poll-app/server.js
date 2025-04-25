const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const expressLayouts = require('express-ejs-layouts');
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/polls');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', './layouts/main');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);

// Frontend routes
// Home page
app.get('/', (req, res) => {
  res.render('index', { title: 'Poll App - Home' });
});

// Auth routes
app.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Poll App - Register', layout: './layouts/main' });
});

app.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Poll App - Login', layout: './layouts/main' });
});

// Poll routes
app.get('/polls', (req, res) => {
  res.render('polls/index', { title: 'Poll App - All Polls', layout: './layouts/main' });
});

app.get('/polls/create', (req, res) => {
  res.render('polls/create', { title: 'Poll App - Create Poll', layout: './layouts/main' });
});

app.get('/polls/:id', (req, res) => {
  res.render('polls/show', { title: 'Poll App - View Poll', layout: './layouts/main' });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/poll-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});