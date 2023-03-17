export interface Notification {
  userId: string;
  title: string;
  body?: string;
  data?: any;
  notificationType: string;
  delay?: number;
}

export interface ExpoNofication {
  to: string;
  sound?: string;
  title?: string;
  body?: string;
  data?: any;
}
