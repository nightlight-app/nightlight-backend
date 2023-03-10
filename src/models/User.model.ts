import mongoose, { Schema } from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
  },
  imgUrlProfileSmall: {
    type: String,
  },
  imgUrlProfileLarge: {
    type: String,
  },
  imgUrlCover: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  friendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  currentGroup: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
  invitedGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  ],
  lastActive: {
    location: {
      latitude: Number,
      longitude: Number,
    },
    time: Date,
  },
  savedGroups: [
    {
      _id: Schema.Types.ObjectId,
      name: String,
      users: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
  ],
});

const User = mongoose.model('User', userSchema);

export default User;
