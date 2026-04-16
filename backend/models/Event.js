import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  category: String,
  icon: String,
  date: String,
  time: String,
  venue: String,
  city: String,
  price: Number,
  image: String,
  description: String,
  tag: String
});

export default mongoose.model('Event', eventSchema);
