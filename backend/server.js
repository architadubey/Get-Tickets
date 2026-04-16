import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Event from './models/Event.js';
import Booking from './models/Booking.js';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/gettickets')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ── ROUTES ──

// MOVIES
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ id: -1 });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/movies', async (req, res) => {
  try {
    const nextId = await Movie.countDocuments() + 1; // simple sequence
    const movie = new Movie({ ...req.body, id: nextId });
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/movies/:id', async (req, res) => {
  try {
    const movie = await Movie.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/movies/:id', async (req, res) => {
  try {
    await Movie.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EVENTS
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ id: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event({ ...req.body, id: 'e' + Date.now() });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BOOKINGS
app.get('/api/bookings', async (req, res) => {
  try {
    let query = {};
    if (req.query.userEmail) {
      query.userEmail = req.query.userEmail;
    }
    const bookings = await Booking.find(query).sort({ bookedAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, id: 'bk' + Date.now().toString(36), bookedAt: new Date() });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// USERS & AUTH
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const user = new User({ ...req.body, id: 'u' + Date.now() });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Very basic dummy auth for demo purposes
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
