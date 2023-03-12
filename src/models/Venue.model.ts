import mongoose, { Schema } from 'mongoose';

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  reactions: [
    {
      userId: {
        type: String,
        required: true,
      },
      emoji: {
        type: String,
        required: true,
      },
      queueId: {
        type: String,
        required: true,
      },
    },
  ],
});

const Venue = mongoose.model('Venue', venueSchema);
export default Venue;
