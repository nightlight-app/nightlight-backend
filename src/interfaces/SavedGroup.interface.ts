import mongoose from 'mongoose';

/**
 * Represents a saved group in the system.
 * @interface SavedGroup
 *
 * @property {mongoose.Types.ObjectId} _id - The unique identifier of the group.
 * @property {string} name - The name of the group.
 * @property {mongoose.Types.ObjectId[]} users - An array of user IDs who are members of the group.
 */
export interface SavedGroup {
  _id: mongoose.Types.ObjectId;
  name: string;
  users: mongoose.Types.ObjectId[];
}
