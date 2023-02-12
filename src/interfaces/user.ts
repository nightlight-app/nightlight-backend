export interface User {
  _id?: string;
  firebaseUid: string;
  imgUrlProfileSmall: string;
  imgUrlProfileLarge: string;
  imgUrlCover: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: Date;
  currentGroup?: any;
  friends: any[];
  lastActive?: LastActive;
  savedGroups: SavedGroup[];
}

export interface SavedGroup {
  name: string;
  users: any[];
}

export interface LastActive {
  location: {
    latitude: number;
    longitude: number;
  };
  time: Date;
}
