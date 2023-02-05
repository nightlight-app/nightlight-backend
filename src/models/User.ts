import mongoose, { Schema } from 'mongoose';

const UserSchema = new mongoose.Schema({
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
  friends: {
    type: [String],
    required: true,
  },
  currentGroup: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
  },
  currentLocation: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
