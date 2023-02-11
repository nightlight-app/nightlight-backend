import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  venueId: {
    type: String,
    required: true,
  },
  emoji: {
    type: String,
    required: true,
  },
});

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
