import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  genre: [String],
  language: String,
  rating: Number,
  poster: String,
  backdrop: String,
  description: String,
  duration: String,
  certificate: String,
  trending: { type: Boolean, default: false },
  votes: String,
  releaseDate: String,
  director: String,
  cast: [String],
  shows: [{ time: String, theater: String, price: Number }]
});

export default mongoose.model('Movie', movieSchema);
