import Group from '../models/Group.model';
import Venue from '../models/Venue.model';

/**
 * Expire a group from the database after the queue job has been processed
 * @param groupId the ID of the group to be expired
 */
export const expireGroup = async (groupId: string) => {
  try {
    await Group.findByIdAndDelete(groupId);
  } catch (error: any) {
    console.log(error);
  }
};

/**
 * Expire a reaction from the database after the queue job has been processed
 * @param userId the user ID of the user who created the reaction
 * @param venueId the venue ID of the venue where the reaction was created
 * @param emoji the emoji of the reaction to be expired
 */
export const expireReaction = async (
  userId: string,
  venueId: string,
  emoji: string
) => {
  try {
    await Venue.updateOne(
      { _id: venueId },
      { $pull: { reactions: { userId: userId, emoji: emoji } } }
    );
  } catch (error: any) {
    console.log(error);
  }
};
