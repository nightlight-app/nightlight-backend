/**
 * An interface representing the last active state of a user.
 * @interface LastActive
 *
 * @property {Object} location - An object with coordinates representing the user's last known location.
 * @property {number} location.latitude - The latitude coordinate of the user's last location.
 * @property {number} location.longitude - The longitude coordinate of the user's last location.
 * @property {Date} time - The date and time when the user was last active.
 */
export interface LastActive {
  location: {
    latitude: number;
    longitude: number;
  };
  time: Date;
}
