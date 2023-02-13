import mongoose, { Schema } from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
  },
  imgUrlProfileSmall: {
    type: String,
    required: true,
  },
  imgUrlProfileLarge: {
    type: String,
    required: true,
  },
  imgUrlCover: {
    type: String,
    required: true,
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
      required: true,
    },
  ],
  currentGroup: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
  lastActive: {
    location: {
      latitude: Number,
      longitude: Number,
    },
    time: Date,
  },
  savedGroups: [
    {
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
