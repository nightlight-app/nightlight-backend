import { Request, Response } from 'express';
import User from '../models/User.model';
import mongoose from 'mongoose';
import Group from '../models/Group.model';
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../config/cloudinary.config';
import { MulterError } from 'multer';
import streamifier from 'streamifier';
import { IMAGE_UPLOAD_OPTIONS } from '../utils/constants';

/**
 * Creates a new user in the database based on the information provided in the request body.
 * @param {Request} req - Express request object containing the user data to be stored.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 201 and an object containing success message and user object if user creation is successful. Otherwise, returns an error status with appropriate message.
 */
export const createUser = async (req: Request, res: Response) => {
  const newUser = new User(req.body);

  try {
    await newUser.save();
    return res
      .status(201)
      .send({ message: 'Successfully created user!', user: newUser });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Retrieves a user's data based on their userId or firebaseUid and returns it as an object.
 * @param {Request} req - Express request object containing the query parameters, including the userId or firebaseUid.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Object} Returns status code 200 and an object containing a success message and the targetUser object if successful.
 * Otherwise, returns an error status with an appropriate message.
 */
export const getUser = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const firebaseUid = req.query.firebaseUid as string;

  // Determine which query parameter was provided (prefer userId over firebaseUid)
  const queryType = userId ? '_id' : 'firebaseUid';

  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (firebaseUid && firebaseUid.length !== 28) {
    return res.status(400).send({ message: 'Invalid firebase UID!' });
  }

  try {
    const targetUser = await User.findOne({
      [queryType]: queryType === '_id' ? userId : firebaseUid,
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Deletes a user matching the provided userId parameter from the database.
 * @param {Request} req - Express request object containing the parameters, including the userId.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Object} Returns status code 200 and a success message if the user was deleted successfully. Otherwise, returns an error status with an appropriate message.
 */
export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(400).send({ message: 'User not found!' });
    }

    return res.status(200).send({ message: 'Successfully deleted user!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Updates an existing user document in the database.
 * @param {Request} req - Express request object containing the parameters, including the userId and updated user data as body.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 200 and an object containing a success message and the updated user object if successful.
 * Otherwise, returns an error status with an appropriate message.
 */
export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    const targetUser = await User.findByIdAndUpdate(userId, req.body);

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Saves a group to the specified user's savedGroups array.
 * @param {Request} req - Express request object containing the userId and the group object to be saved in the user's savedGroups array.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User} Returns status code 200 and an object containing a success message and updated details of the user, otherwise returns an error status with appropriate message.
 */
export const saveGroup = async (req: Request, res: Response) => {
  const userId = req.params?.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    const targetUser = await User.findByIdAndUpdate(userId, {
      $push: {
        savedGroups: { ...req.body, _id: new mongoose.Types.ObjectId() },
      },
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Deletes a saved group from a user's list of saved groups
 * @param {Request} req - the request object containing user and saved group IDs
 * @param {Response} res - the response object
 * @returns {Promise} - a promise that resolves to a response object
 * indicating whether the saved group was successfully deleted or the error that occurred
 */
export const deleteSavedGroup = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const savedGroupId = req.query.savedGroupId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (!mongoose.Types.ObjectId.isValid(savedGroupId)) {
    return res.status(400).send({ message: 'Invalid saved group ID!' });
  }

  try {
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: {
        savedGroups: { _id: savedGroupId },
      },
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }
    return res
      .status(200)
      .send({ message: 'Successfully updated user!', user: targetUser });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * API endpoint for accepting a group invitation for a user.
 * @param {Request} req - The request object containing the userId and groupId to accept.
 * @param {Response} res - The response object sent back with a success or error message.
 * @returns {Promise} Returns a Promise containing the response after updating the database.
 */
export const acceptGroupInvitation = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const groupId = req.query.groupId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  try {
    // Remove groupId from invited groups and add to currentGroup
    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { invitedGroups: groupId },
      currentGroup: groupId,
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    // Remove userId from invitedMembers in group and add to members in group
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { invitedMembers: userId },
      $push: { members: userId },
    });

    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully accepted invitation to group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * An async function that enables a user to leave a group they are currently in
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Response} - A JSON response indicating success or failure or error message with a 500 status code.
 */
export const leaveGroup = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const groupId = req.query.groupId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).send({ message: 'Invalid group ID!' });
  }

  try {
    const targetGroup = await Group.findByIdAndUpdate(groupId, {
      $pull: { members: userId },
    });

    if (targetGroup === null) {
      return res.status(400).send({ message: 'Group does not exist!' });
    }

    const targetUser = await User.findByIdAndUpdate(userId, {
      currentGroup: undefined,
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res.status(200).send({ message: 'Successfully left group!' });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

/**
 * Retrieves a user's friends based on their userId and returns them as an array of User objects.
 * @param {Request} req - Express request object containing the parameters, including the userId.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {User[]} Returns status code 200 and an object containing a success message and an array of friendUser objects if successful. Otherwise, returns an error status with an appropriate message.
 */
export const getFriends = async (req: Request, res: Response) => {
  const userId = req.params?.userId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  try {
    const targetUser = await User.findById(userId);

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    const targetFriends = await User.find({
      _id: { $in: targetUser?.friends },
    });

    if (targetFriends === null) {
      return res.status(400).send({ message: 'A friend does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully found friends!', friends: targetFriends });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Sends a request to add a friend for the user with the specified userId.
 * @param {Request} req - Express request object containing parameters: userId and friendId.
 * @param {Response} res - Express response object used to send the response back to the client.
 * @returns {Promise} Returns status code 200. Otherwise, returns an error status with an appropriate message.
 */
export const requestFriend = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    const targetUser = await User.findById(userId);

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    const targetFriend = await User.findByIdAndUpdate(friendId, {
      $push: { friendRequests: userId },
    });

    if (targetFriend === null) {
      return res
        .status(400)
        .send({ message: 'User being requested does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully sent friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Accepts friend request and adds the new friend to user's friends list while removing the request from
 * friendRequests list.
 * @param {Request} req - Express Request object
 * @param {Response} res - Express Response object
 * @returns {Promise} Returns success message on successful addition of friend, otherwise returns an error message
 * with corresponding status code.
 */
export const acceptFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    const targetUser = await User.findByIdAndUpdate(userId, {
      $push: { friends: friendId },
      $pull: { friendRequests: friendId },
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    const targetFriendUser = await User.findByIdAndUpdate(friendId, {
      $push: { friends: userId },
    });

    if (targetFriendUser === null) {
      return res.status(400).send({ message: 'Friend does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully accepted friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Accepts a friend request for a user by updating both their friends and friendRequests arrays.
 * @param req - the Request object containing userId in the params and friendId in the query
 * @param res - the Response object sent back to the client
 * @returns Returns either an error response with a 400 or 500 status code and a message,
 * or a success response with a 200 status code and a message
 */
export const declineFriendRequest = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const friendId = req.query.friendId as string;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send({ message: 'Invalid user ID!' });
  }

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).send({ message: 'Invalid friend ID!' });
  }

  try {
    const targetFriend = await User.findById(friendId);

    if (targetFriend === null) {
      return res
        .status(400)
        .send({ message: 'User requesting does not exist!' });
    }

    const targetUser = await User.findByIdAndUpdate(userId, {
      $pull: { friendRequests: friendId },
    });

    if (targetUser === null) {
      return res.status(400).send({ message: 'User does not exist!' });
    }

    return res
      .status(200)
      .send({ message: 'Successfully declined friend request!' });
  } catch (error: any) {
    return res.status(500).send({ message: error?.message });
  }
};

/**
 * Uploads a profile image for the user with the specified userId to cloudinary
 * and updates the user's field to point to the new image.
 *
 * @param req - the Request object containing the userId in the params and the image in the body
 * @param res - the Response object sent back to the client
 * @returns Returns either an error response with a 400 or 500 status code and a message,
 * or a success response with a 200 status code and a message
 */
export const uploadProfileImg = async (req: Request, res: Response) => {
  // pass everything to multer upload so we can retrieve the image from req.file
  upload(req, res, async err => {
    if (err instanceof MulterError || err) {
      return res.status(500).send({ message: err?.message });
    }

    const userId = req.params?.userId;
    const image = req.file;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send({ message: 'Invalid user ID!' });
    }

    if (!image) {
      return res.status(400).send({ message: 'No image provided!' });
    }

    try {
      const targetUser = await User.findById(userId);

      if (targetUser === null) {
        return res.status(400).send({ message: 'User does not exist!' });
      }

      // transform image to 128x128 and 256x256 and upload to cloudinary
      IMAGE_UPLOAD_OPTIONS.forEach(option => {
        // use streamifier to convert buffer to stream
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            // the public id of the image
            public_id: `${userId}-${option.dimension}`,
            // the folder in cloudinary to upload to
            folder: 'profile-images',
            // overwrite the image if it already exists
            overwrite: true,
            // the transformation to apply to the image
            transformation: [
              {
                width: option.width,
                height: option.height,
              },
            ],
          },
          async (err, result) => {
            if (err) console.log(err);
            if (result) {
              // save the image url to the user's profile
              await User.findByIdAndUpdate(userId, {
                [option.userField]: result.url,
              });
            }
          }
        );
        // pipe the buffer to the upload stream and send the response
        streamifier.createReadStream(image.buffer).pipe(uploadStream);
      });

      return res.status(200).send({ message: 'Successfully uploaded image!' });
    } catch (error: any) {
      return res.status(500).send({ message: error?.message });
    }
  });
};
