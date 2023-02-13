import mongoose, { Schema } from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  invitedMembers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  ],
  expectedDestination: {
    latitude: Number,
    longitude: Number,
  },
  creationTime: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  returnTime: {
    type: Date,
    required: true,
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
