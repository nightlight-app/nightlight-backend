/**
 * An interface representing the last active state of a user.
 * @interface LastActive
 *
 * @property {Object} location - An object with coordinates representing the user's last known location.
 * @property {number} location.latitude - The latitude coordinate of the user's last location.
 * @property {number} location.longitude - The longitude coordinate of the user's last location.
 * @property {String} time - The date and time (UTC) when the user was last active.
 */
export interface LastActive {
  location: LocationData;
  time: String;
}

/**
 * An interface representing a location
 * @interface LocationData
 *
 * @property {number} latitude - The latitude coordinate of the user's last location.
 * @property {number} longitude - The longitude coordinate of the user's last location.
 */
export interface LocationData {
  latitude: number;
  longitude: number;
}
