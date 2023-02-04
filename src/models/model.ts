import mongoose from 'mongoose';

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
  currentLocation: {
    latitude: {
      type: String,
      required: true,
    },
    longitude: {
      type: String,
      required: true,
    },
  },
});

const User = mongoose.model('User', UserSchema);

export default User;
