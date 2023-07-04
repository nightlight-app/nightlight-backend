import mongoose from 'mongoose';

/**
 * Mongoose schema for storing venues
 * @typedef {Object} VenueSchema
 *
 * @property {?string} _id - The unique identifier of the venue. Auto-generated by MongoDB.
 * @property {string} name - The name of the venue.
 * @property {string} address - The address of the venue.
 * @property {?Array<Object.<string, string|mongoose.Types.ObjectId>>} reactions - An array containing objects that represent a user reaction to the venue.
 * @property {Object.<string, number>} location - An object containing latitude and longitude values representing the location of the venue.
 */
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
