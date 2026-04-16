import mongoose from 'mongoose';
import fs from 'fs';
import Movie from './models/Movie.js';
import Event from './models/Event.js';

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/gettickets')
  .then(() => console.log('MongoDB Connected to seed data'))
  .catch(err => console.error(err));

const seedData = async () => {
  try {
    // Read JSON files
    const moviesRaw = fs.readFileSync('../BookMyShow/src/data/movies.json');
    const eventsRaw = fs.readFileSync('../BookMyShow/src/data/events.json');

    const moviesData = JSON.parse(moviesRaw);
    const eventsData = JSON.parse(eventsRaw);

    // Clear existing
    await Movie.deleteMany({});
    await Event.deleteMany({});

    // Seed Movies
    for (const m of moviesData) {
      const movie = new Movie(m);
      await movie.save();
    }
    console.log('Movies seeded successfully!');

    // Seed Events
    for (const e of eventsData) {
      if (typeof e.price === 'string') {
        e.price = parseInt(e.price.replace(/[^\d]/g, ''), 10) || 0;
      }
      const event = new Event(e);
      await event.save();
    }
    console.log('Events seeded successfully!');

    process.exit();
  } catch (err) {
    console.error('Error with data seed:', err);
    process.exit(1);
  }
};

seedData();
