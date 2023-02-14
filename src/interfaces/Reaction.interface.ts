import mongoose from 'mongoose';

export interface Reaction {
  userId: mongoose.Types.ObjectId;
  venueId: mongoose.Types.ObjectId;
  emoji: string;
}
