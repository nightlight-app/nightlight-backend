export interface MongoNotification {
  userId: string;
  title: string;
  body: string;
  data: any;
  notificationType: string;
  delay: number;
}

export interface ExpoNotification {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: any;
}
