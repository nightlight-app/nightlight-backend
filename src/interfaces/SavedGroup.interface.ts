import mongoose from 'mongoose';

export interface SavedGroup {
  _id: mongoose.Types.ObjectId;
  name: string;
  users: mongoose.Types.ObjectId[];
}
