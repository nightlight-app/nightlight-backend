import Ping from '../models/Ping.model';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';
import User from '../models/User.model';

import { sendNotifications } from '../utils/notification.utils';
import { NotificationType } from '../interfaces/Notification.interface';
import { PingStatus } from '../interfaces/Ping.interface';
import { nightlightQueue } from '../queue/setup/queue.setup';
import mongoose from 'mongoose';
import type { Request, Response } from 'express';

/**
 * Sends a ping from the sender to the recipient.
 * Adds a queue job to change the ping status after the expiration date.
 * Sends a notification to the recipient about the ping.
 *
 * @param {Request} req - Express request object containing the ping object data
 * @param {Response} res - Express response object containing the ping object data after it has been saved to the database
 * @returns {Promise<Ping>} - Resolved promise containing the ping object data after it has been saved to the database
 */
export const sendPing = async (req: Request, res: Response) => {
  // Get the ping object from the request body
  const pingData = req.body;

  // Get the current date and time
  const sentDateTime = new Date().toUTCString();

  // Verify that the ping object has all the necessary keys
  const validationError = verifyKeys(pingData, KeyValidationType.PING);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  try {
    // Check if the sender id is valid
    const ping = { ...pingData, sentDateTime, status: PingStatus.SENT };

    // Create a new ping from the request body
    const newPing = new Ping(ping);

    // Calculate the delay for the ping expiration
    //const delay =
    //  new Date().getTime() - new Date(ping.expirationDateTime).getTime();

    // TODO: Add the ping expiration to the queue after the ping frontend is finished (commented for now)

    // Add the ping expiration to the queue
    // const job = await addPingExpireJob(savedPing._id.toString(), delay);

    // Check if the job was added to the queue
    // if (!job) {
    //   return res
    //     .status(400)
    //     .send({ message: 'Failed to remove ping, queue error!' });
    // }

    // Add the queue ID to the ping (blank for now)
    newPing.queueId = '';

    // Add the ping to the recipient's list of pings
    const recipientUser = await User.findById(ping.recipientId);

    // Add the ping to the sender's list of pings
    const senderUser = await User.findById(ping.senderId);

    // Check if the user exists
    if (recipientUser === null) {
      return res.status(400).send({ message: 'Recipient not found' });
    }

    // Check if the user exists
    if (senderUser === null) {
      return res.status(400).send({ message: 'Sender not found' });
    }

    // Add the ping to the recipient's list of pings
    recipientUser.receivedPings.push(newPing._id);

    // Add the ping to the sender's list of pings
    senderUser.sentPings.push(newPing._id);

    // Save the pings and users to the database
    await newPing.save();
    await recipientUser.save();
    await senderUser.save();

    // Send a notification to the recipient
    sendNotifications(
      [ping.recipientId.toString()],
      'New ping!📩',
      `${senderUser.firstName} ${senderUser.lastName} has sent you a ping!`,
      {
        notificationType: NotificationType.pingReceived,
        sentDateTime: new Date().toUTCString(),
        pingId: newPing._id.toString(),
        recipientId: ping.recipientId.toString(),
        recipientFirstName: recipientUser.firstName,
        recipientLastName: recipientUser.lastName,
        senderId: ping.senderId.toString(),
        senderFirstName: senderUser.firstName,
        senderLastName: senderUser.lastName,
      },
      true
    );

    // Send the ping back to the user
    return res
      .status(201)
      .send({ message: 'Ping sent successfully', ping: newPing });
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
};

/**
 * Responds to a ping from the recipient.
 * Removes the ping expiration from the queue.
 * Sends a notification to the sender about the ping response and sends a notification to the recipient about the ping response.
 *
 * @param {Request} req - Express request object containing the ping object data
 * @param {Response} res - Express response object containing the ping object data after it has been saved to the database
 * @returns {Promise<Ping>} - Resolved promise containing the ping object data after it has been saved to the database
 */
export const respondToPing = async (req: Request, res: Response) => {
  const pingId = req.params.pingId as string;
  const response = req.body.response as string;

  // Verify that the ping ID and response are present
  if (!pingId) {
    return res.status(400).send({ message: 'Ping ID is required' });
  }

  // Verify that the ping ID is valid
  if (!mongoose.Types.ObjectId.isValid(pingId)) {
    return res.status(400).send({ message: 'Invalid ping ID' });
  }

  //  Verify that the response is present
  if (!response) {
    return res.status(400).send({ message: 'Response is required' });
  }

  // Verify that the response is a valid value
  if (
    response !== PingStatus.RESPONDED_OKAY &&
    response !== PingStatus.RESPONDED_NOT_OKAY
  ) {
    return res.status(400).send({ message: 'Invalid response value.' });
  }

  // Create a new mongoose ObjectId from the ping ID
  const pingObjectId = new mongoose.Types.ObjectId(pingId);

  try {
    const targetPing = await Ping.findById(pingObjectId);

    // Check if the ping exists
    if (targetPing === null) {
      return res.status(400).send({ message: 'Ping not found' });
    }

    // Add the ping to the recipient's list of pings
    const recipientUser = await User.findById(targetPing.recipientId);

    // Find the sender
    const senderUser = await User.findById(targetPing.senderId);

    // Check if the user exists
    if (recipientUser === null) {
      return res.status(400).send({ message: 'Recipient not found' });
    }

    // Check if the user exists
    if (senderUser === null) {
      return res.status(400).send({ message: 'Sender not found' });
    }

    if (targetPing.queueId) {
      // Remove the ping expiration from the queue
      nightlightQueue.remove(targetPing.queueId);
    }

    // Update the ping status
    targetPing.status = response;

    // Save the ping to the database
    await targetPing.save();

    // Add the ping to the sender's list of pings
    const responseValue =
      response === PingStatus.RESPONDED_OKAY ? 'okay ✅' : 'not okay 🚨';

    // Send a notification to the sender
    sendNotifications(
      [targetPing.senderId.toString()],
      'Ping response!📩',
      `${recipientUser.firstName} ${recipientUser.lastName} responded: ${responseValue}!`,
      {
        notificationType:
          response === PingStatus.RESPONDED_OKAY
            ? NotificationType.pingRespondedOkay
            : NotificationType.pingRespondedNotOkay,
        sentDateTime: new Date().toUTCString(),
        pingId: targetPing._id.toString(),
        recipientId: targetPing.recipientId.toString(),
        recipientFirstName: recipientUser.firstName,
        recipientLastName: recipientUser.lastName,
        senderId: targetPing.senderId.toString(),
        senderFirstName: senderUser.firstName,
        senderLastName: senderUser.lastName,
      },
      true
    );

    // Send the ping back to the user
    return res
      .status(200)
      .send({ message: 'Ping responded successfully', ping: targetPing });
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
};

/**
 * Removes a ping from the database and removes the ping expiration from the queue.
 *
 * @param {Request} req - Express request object containing the ping object data
 * @param {Response} res - Express response object containing the ping object data after it has been saved to the database
 * @returns {Promise<Ping>} - Resolved promise containing the ping object data after it has been saved to the database
 */
export const removePing = async (req: Request, res: Response) => {
  const pingId = req.params.pingId as string;

  // Verify that the ping ID is present
  if (!pingId) {
    return res.status(400).send({ message: 'Ping ID is required' });
  }

  // Verify that the ping ID is valid
  if (!mongoose.Types.ObjectId.isValid(pingId)) {
    return res.status(400).send({ message: 'Invalid ping ID' });
  }

  // Create a new mongoose ObjectId from the ping ID
  const pingObjectId = new mongoose.Types.ObjectId(pingId);

  try {
    // Remove the ping from the database
    const removedPing = await Ping.findById(pingObjectId);

    // Check if the ping exists
    if (removedPing === null) {
      return res.status(400).send({ message: 'Ping not found' });
    }

    // Remove the ping from the recipient's list of pings
    const recipientUser = await User.findById(removedPing.recipientId);

    // Remove the ping from the sender's list of pings
    const senderUser = await User.findById(removedPing.senderId);

    // Check if the user exists
    if (recipientUser === null) {
      return res.status(400).send({ message: 'Recipient not found' });
    }

    // Check if the user exists
    if (senderUser === null) {
      return res.status(400).send({ message: 'Sender not found' });
    }

    // Remove the ping from the recipient's list of pings
    recipientUser.receivedPings.filter(ping => !ping.equals(removedPing._id));

    // Remove the ping from the sender's list of pings
    senderUser.sentPings.filter(ping => !ping.equals(removedPing._id));

    // Save the users to the database and remove the ping
    await recipientUser.save();
    await senderUser.save();
    await removedPing.remove();

    // Remove the ping expiration from the queue
    if (removedPing.queueId) {
      nightlightQueue.remove(removedPing.queueId);
    }

    // Send a notification to the recipient
    sendNotifications(
      [removedPing.recipientId.toString()],
      'Ping removed!📤',
      `${senderUser.firstName} ${senderUser.lastName} is no longer pinging you.`,
      {
        notificationType: NotificationType.pingRemoved,
        sentDateTime: new Date().toUTCString(),
        pingId: removedPing._id.toString(),
        senderId: removedPing.senderId.toString(),
        senderFirstName: senderUser.firstName,
        senderLastName: senderUser.lastName,
      },
      false
    );

    // Send the ping back to the user
    return res.status(200).send({ message: 'Ping removed successfully' });
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
};
