import Ping from '../models/Ping.model';
import { Request, Response } from 'express';
import { KeyValidationType, verifyKeys } from '../utils/validation.utils';
import User from '../models/User.model';
import { addPingExpireJob, addReactionExpireJob } from '../queue/jobs';
import { sendNotifications } from '../utils/notification.utils';
import { NotificationType } from '../interfaces/Notification.interface';
import { PingStatus } from '../interfaces/Ping.interface';
import mongoose from 'mongoose';

/**
 * TODO
 *
 * Create ping
 * Send expiration to queue
 * Send notification to recipient
 *
 * @param req
 * @param res
 * @returns
 */
export const sendPing = async (req: Request, res: Response) => {
  // Get the ping object from the request body
  const pingData = req.body;

  const sentDateTime = new Date().toUTCString();

  // Verify that the ping object has all the necessary keys
  const validationError = verifyKeys(pingData, KeyValidationType.PING);
  if (validationError !== '') {
    return res.status(400).send({ message: validationError });
  }

  const ping = { ...pingData, sentDateTime, status: PingStatus.SENT };

  const newPing = new Ping(ping);

  try {
    // Save the ping to the database
    const savedPing = await newPing.save();

    // Check if the ping was saved
    if (savedPing === null) {
      return res.status(500).send({ message: 'Ping could not be saved' });
    }

    // Add the ping to the recipient's list of pings
    const recipientUser = await User.findByIdAndUpdate(ping.recipientId, {
      $push: { receivedPings: newPing._id },
    });

    // Check if the user exists
    if (recipientUser === null) {
      return res.status(400).send({ message: 'Recipient not found' });
    }

    // Add the ping to the sender's list of pings
    const senderUser = await User.findByIdAndUpdate(ping.senderId, {
      $push: { sentPings: newPing._id },
    });

    // Check if the user exists
    if (senderUser === null) {
      return res.status(400).send({ message: 'Sender not found' });
    }

    // Calculate the delay for the ping expiration
    const delay =
      new Date().getTime() - new Date(ping.expirationDateTime).getTime();

    // Add the ping expiration to the queue
    addPingExpireJob(newPing._id.toString(), delay);

    // Send a notification to the recipient
    sendNotifications(
      [ping.recipientId.toString()],
      'New ping!📩',
      `${senderUser.firstName} ${senderUser.lastName} has sent you a ping!`,
      {
        notificationType: NotificationType.pingReceived,
        sentDateTime: new Date().toUTCString(),
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

  try {
    const ping = await Ping.findByIdAndUpdate(
      pingId,
      { status: response },
      { new: true }
    );

    // Check if the ping exists
    if (ping === null) {
      return res.status(400).send({ message: 'Ping not found' });
    }

    // Add the ping to the recipient's list of pings
    const recipientUser = await User.findById(ping.recipientId);

    // Check if the user exists
    if (recipientUser === null) {
      return res.status(400).send({ message: 'Recipient not found' });
    }

    // Add the ping to the sender's list of pings
    const responseValue =
      response === PingStatus.RESPONDED_OKAY ? 'okay ✅' : 'not okay 🚨';

    // Send a notification to the sender
    sendNotifications(
      [ping.senderId.toString()],
      'Ping response!📩',
      `${recipientUser.firstName} ${recipientUser.lastName} responded: ${responseValue}!`,
      {
        notificationType:
          response === PingStatus.RESPONDED_OKAY
            ? NotificationType.pingRespondedOkay
            : NotificationType.pingRespondedNotOkay,
        sentDateTime: new Date().toUTCString(),
      },
      true
    );

    // Send the ping back to the user
    return res.status(200).send({ message: 'Ping responded successfully' });
  } catch (error: any) {
    return res.status(500).send({ error: error.message });
  }
};
