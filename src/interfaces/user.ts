export interface User {
  firebaseUid: string;
  imgUrlProfileSmall: string;
  imgUrlProfileLarge: string;
  imgUrlCover: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: Date;
  friends: string[];
  currentLocation: {
    latitude: string;
    longitude: string;
  };
}
