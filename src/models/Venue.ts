import mongoose, { Schema } from 'mongoose';

const VenueSchema = new mongoose.Schema({
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
  reactions: {
    '🔥': [{ type: Schema.Types.ObjectId, ref: 'User' }],
    '⛨': [{ type: Schema.Types.ObjectId, ref: 'User' }],
    '🎉': [{ type: Schema.Types.ObjectId, ref: 'User' }],
    '⚠️': [{ type: Schema.Types.ObjectId, ref: 'User' }],
    '💩': [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
});

const Venue = mongoose.model('Venue', VenueSchema);
export default Venue;
