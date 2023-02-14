import mongoose from 'mongoose';

export interface SavedGroup {
  name: string;
  users: mongoose.Types.ObjectId[];
}
