import type mongoose from 'mongoose';

/**
 * Specifies the properties of a Group instance in the application.
 *
 * @interface Group
 * @param {string} _id - The ID of the group (optional).
 * @param {string} name - The name of the group.
 * @param {mongoose.Types.ObjectId[]} members - An array containing the IDs of the members belonging to the group.
 * @param {mongoose.Types.ObjectId[]} invitedMembers - An array containing the IDs of the members who have been invited to the group.
 * @param {String} creationDatetime - A Date string (UTC) representing when this group was created.
 * @param {String} expirationDatetime - A Date string (UTC) representing when this group is set to expire.
 * @param {{latitude: number, longitude: number}} expectedDestination - An object consisting of latitude and longitude values indicating the expected destination for the group.
 */
export interface Group {
  _id?: string;
  name: string;
  members: mongoose.Types.ObjectId[];
  invitedMembers: mongoose.Types.ObjectId[];
  creationDatetime: string;
  expirationDatetime: string;
  expectedDestination?: {
    latitude: number;
    longitude: number;
  };
}
