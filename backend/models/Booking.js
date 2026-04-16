import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  movieId: Number,
  movieTitle: String,
  userEmail: String,
  seats: [String],
  showTime: String,
  theater: String,
  totalAmount: Number,
  bookedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);
