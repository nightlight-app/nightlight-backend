/**
 * Sends a notification to the specified Expo push token with the given title, body, and data.
 * @param expoPushToken The push token of the device to receive the notification.
 * @param title The title of the notification.
 * @param body The body text of the notification.
 * @param data Any additional data to send along with the notification.
 */
export const sendNotification = async (
  expoPushToken: string,
  title: string,
  body: string,
  data: any
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
