# nightlight (backend)

This is the backend for the nightlight app. It is a RESTful API built with Node.js and Express.js. It uses MongoDB as its database. It implements a messaging queue for delay actions and expiring data.

### _To run the full server locally_:

1. Install the packages

```zsh
npm install
```

2. Install ttab CLI (add a `sudo` in front if you get EACCES error):

```zsh
npm install ttab -g
```

3. Verify that `ttab` is installed (this should spawn a new terminal) and follow instruction to allow permission:

```zsh
ttab -w
```

4. If on Mac, go to `System Preferences` > `Security & Privacy` > `Accessibility` and check the `Visual Studio Code` box and the terminal you use (i.e. `iTerm2`).

<img width="400" src="https://i.imgur.com/mRiL3PJ.png">

5. Run `docker compose up`, `npm run worker`, and `nodemon src/index.ts` with one command:

```zsh
npm run start
```

**Common issues:**

- _System Events got an error: osascript is not allowed assistive access._
  Go to `System Preferences` > `Privacy` > `Accessibility` and allow `VSCode` to give permission for `ttab` to run.

# Models
---
## User

```json
{
    "_id": mongoose.Types.ObjectId,
    "firebaseUid": string,
    "imgUrlProfileSmall": string,
    "imgUrlProfileLarge": string,
    "imgUrlCover": string,
    "firstName": string,
    "lastName": string,
    "email": string,
    "phone": string,
    "birthday": Date,
    "currentGroup": mongoose.Types.ObjectId | undefined,
    "friends": mongoose.Types.ObjectId[],
    "friendRequests": mongoose.Types.ObjectId[],
    "lastActive?": {
        "location": {
        "latitude": Number,
        "longitude": Number,
        },
        "time": Date,
    },
    "savedGroups": [{
        "name": String,
        "users": mongoose.Types.ObjectId[],
    }],
}
```

## Group

```json
{
    "_id": mongoose.Types.ObjectId,
    "name": String,
    "members": mongoose.Types.ObjectId[],
    "invitedMembers": mongoose.Types.ObjectId[],
    "expectedDestination": {
        "latitude": Number,
        "longitide": Number,
    },
    "creationDatetime": Date,
    "expirationDatetime": Date,
}
```

## Venue

```json
{
    "_id": mongoose.Types.ObjectId,
    "address": String,
    "location": String,
    "reactions": [{
        userId: String,
        emoji: String,
        date: Date
    }]
}
```

## Notification
```json
{
    "_id": mongoose.Types.ObjectId,
    "userId": mongoose.Types.ObjectId,
    "title": String,
    "body": String,
    "data": Object,
    "delay": Number
}
```

# Worker
---

### Queue setup:
When the REST server is started it also creates the queue using the queue.setup.ts file with a specific name (nightlight-queue). The queue assumes the presence of a redis container running on port 6379. To add to the queue we use jobs.

### Jobs:
Jobs are how the REST server adds to the queue. In jobs.ts we have a function called addGroupExpireJob which takes in the groupId to be added to the queue and a specified delay in milliseconds. We add the job to the queue with a job name (string), the job data (a type and the groupId) and the delay. There is an interface for the Job for extra type checking.

### Worker Setup:
The worker is a seperate node process in the same codebase that is run in parallel to the REST server, also assuming the presence of a redis container at port 6379. The worker's function is to intently stare at the redis queue (which was marked by the name setup in the queue.setup.ts) and to emit actions when the queue items pop out of the queue. When setting up the worker in workers.setup.ts, we have to connect to mongo again since this is a seperate process. The worker handler function takes the job and decides what to do with that job based off of the type (string) in the job. Internally, the delayed queue jobs are put on a seperate queue while they wait to expire while the jobs that can be processed at the current instance are handled on a seperate main queue.

### Workers:
The worker functions in worker.ts do the actions based on the jobs popped off the queue. In this case we are deleting the group from mongo. Since the mongo model exists within the same codebase as both the worker and the REST server, we do not have to duplicate the code despite the worker being a seperate node process.

### Tests:
In group.controller.test.ts at the end of the first describe block you can see that we get the group (which should be successful) and delay the tests for 5000 milliseconds. When we get the group again it should not exist since the delay in the queue was set to 3000 milliseconds in the createGroup function in group.controller.ts. We'll have to modify this in the future to do the actual delay.

# Authorization
---

When sending any request, be sure to include the firebase id in the headers of the request.
Also, make sure the environment variable in the .env is sent to anything but `'development'`.
```tsx
fetch(url, {
  headers: {
    'Authorization': `Bearer ${firebaseId}`
  }
}).then((response) => {
    // code
});
```

# Notifications
---
### Notification Collection and Interfaces

Push notifications are sent to the user in the following function, which uses the expo push notifications service that handles the architecture and security relate to apple push notification services (APNS):

```tsx
export const sendNotificationToExpo = async (
  notification: ExpoNotification
) => {
  // code
};
```
When sending a notification to expo, we use an interface defined by the expo push notification service:

```tsx
interface ExpoNotification {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: Object;
}
```

We are going to have to store notifications in the database for a variety of reasons. We can store them in a separate collection and index them by a user’s mongo id:

```tsx
interface MongoNotification {
    userId: string, // indexed by this
    title: string,
    body: string,
    data: NotificationData,
    delay: number
}
```

where we store the notification data in a nightlight defined object:

```tsx
interface NotificationData {
    notificationType: String
}
```


The notification type in the mongo document will be a string that invokes differences in the notification screen. For example we want notifications for friend requests, group invites, group updates, check ins, pings, etc. We will have to be able to distinguish between them (since the actions will be different for each type of notification)

### Notification Handlers

The backend has an endpoint to handle adding notifications but the user will **never** use this endpoint. The endpoint can be used by us for sending marketing and other notifications to the users but there is never a case where a user needs to send a notification that isn’t accompanied by an action done in another endpoint.

Sending notifications is a separate function in the backend that can be called by any endpoint or worker function. It's important to note that a notification caused by a user action will never be put onto the queue. For example, if a group is created we don’t want to put a notification job and a group expiration job on the queue. Instead, we want to add just the group expiration job and when the group expires we want to send a notification from the worker that is completing the group expiration job.

The function to send a notification is found in `notification.utils.ts` and headered as follows:

```tsx
export const sendNotifications = async (
  userIds: string[],
  title: string,
  body: string,
  data: NotificationData,
  delay: number = 0
) => {
    // code
});
```

The function sends both a notification to the mongo and through the expo push notifications service. This is important to know because it means that this function is the only function in `notification.utils.ts` that should be called by a user action. The functions `sendNotificationToExpo` and `sendNotificationToUser` are helper functions that simplify the code of the `sendNotifications` functions. The only exception to this is in the admin endpoint described before that will not be used by the users (the endpoint for sending notifications to the mongo only). If the user does not have a push notifications token (the token is undefined in their user document), the function will simply skip over them and not attempt to send the push notification.

The notifications are done automatically by the backend based on the endpoint that is called. The function can be passed a list of user ids that the notifications can be sent to with a common title, body, data, type, and delay.

We need to be sure to remember that some users will not have push notifications enabled. Therefore, the notifications should still be added to mongo even if they are not pushed through expo. 

Notifications are secondary to any action that is completed in the database. For example, if the user creates a group and the notification fails to send to either the database or the expo, the database should remain if the group was created correctly. This means all of the notification stuff **needs** to be no throw or made in some way such that the success of the notifications do not have an effect on the success of the http request as a whole.

In the future, users will have notification preferences that will be checked against when sending push notifications. Users will have the choice to only receive push notifications for certain actions which they can choose in the app settings.

# API Endpoints
---
| HTTP Method                                               | Name                                                           | Description                                                                                                                                                                     | Parameters                                                                                                                                                                                                                                                                                               | Responses                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/user`                                                        | Create a user.                                                                                                                                                                  | ...all user fields                                                                                                                                                                                                                                                                                       | [`201`] Successful user creation. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                                                     |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/user/?userId={userId}`                                       | Get a single user by id. Body contains necessary fields for user.                                                                                                               | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. (optional)                                                                                                                                                                                                        | [`200`] - Successful user retrieval. <br> [`400`] User not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Bad Request <br> [`500`] Internal server error.                                   |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}`                                               | Update a user document. Body contains fields to update.                                                                                                                         | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> ...all new user fields.                                                                                                                                                                                  | [`200`] - Successful user update. <br> [`400`] User not found.<br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                        |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/user/{userId}`                                               | Delete a user.                                                                                                                                                                  | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user.                                                                                                                                                                                                                   | [`200`] - Successful user deletion. <br> [`400`] User not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                      |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/user/{userId}/friends`                                       | Retrieve the user objects of a user's friends                                                                                                                                   | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user.                                                                                                                                                                                                                   | [`200`] - Successful user deletion. <br> [`400`] User not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                      |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/saveGroup`                                     | Save a group configuration to the user object                                                                                                                                   | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `body` (JSON) - The simplified data for the saved group `{ name: string, friends: ObjectId[] }`                                                                                                          | [`200`] - Successful user deletion. <br> [`400`] User not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                      |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/deleteSavedGroup/?savedGroupId={savedGroupId}` | Delete a saved group by id                                                                                                                                                      | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `savedGroupId` (Object ID) - The mongo UUID for the saved group                                                                                                                                          | [`200`] - Successful user deletion. <br> [`400`] User or saved group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                       |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/acceptGroupInvitation/?groupId={groupId}`      | Accept an invitation to a created group                                                                                                                                         | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group.                                                                                                                 | [`200`] - Successful user deletion. <br> [`400`] User or group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                             |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/leaveGroup/?groupId={groupId}`                 | Leave the current group that the user is in                                                                                                                                     | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group.                                                                                                                 | [`200`] - Successful user deletion. <br> [`400`] User or group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                             |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/requestFriend/?friendId={friendId}`            | Request a different user to be mutual friends                                                                                                                                   | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `friendId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target friend user.                                                                                                          | [`200`] - Successful user deletion. <br> [`400`] User or friend not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                            |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/acceptFriendRequest/?friendId={friendId}`      | Accept a friend request from a user to be mutual friends                                                                                                                        | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `friendId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target friend user.                                                                                                          | [`200`] - Successful user deletion. <br> [`400`] User or friend not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                            |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}/declineFriendRequest/?friendId={friendId}`     | Decline a friend request from a user to be mutual friends                                                                                                                       | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> `friendId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target friend user.                                                                                                          | [`200`] - Successful user deletion. <br> [`400`] User or friend not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                            |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/group`                                                       | Create a group. Body should contain necessary field for group.                                                                                                                  | ...all group fields                                                                                                                                                                                                                                                                                      | [`201`] - Successful group creation. <br> [`404`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error.                                                                 |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/group/?groupId={groupId}`                                    | Get a single group by group id.                                                                                                                                                 | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group.                                                                                                                                                                                                                 | [`200`] - Successful group retrieval.<br> [`400`] - Group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                 |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/group/{groupId}`                                             | Replace a group document entirely.                                                                                                                                              | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. <br><br> ...all new group fields.                                                                                                                                                                               | [`200`] - Successful group update.<br> [`400`] - Group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                    |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/group/{groupId}`                                             | Delete a group.                                                                                                                                                                 | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group.                                                                                                                                                                                                                 | [`200`] - Successful group deletion.<br> [`400`] - Group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                  |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/venue`                                                       | Create a venue. Should only be called for testing purposes. Body contains all necessary fields for venue.                                                                       | ...all venue fields                                                                                                                                                                                                                                                                                      | [`201`] - Successful venue creation. <br> [`404`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error.                                                                 |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/venue/?venueId={venueId}`                                    | Get a single venue by venue id.                                                                                                                                                 | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. (optional)                                                                                                                                                                                                      | [`200`] - Successful venue retrieval.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                 |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/venue/{venueId}`                                             | Update a venue document. Body should contain fields to be replaced. Do not use for any reaction logic. (NOT IMPLEMENTED YET)                                                    | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> ...all new venue feilds.                                                                                                                                                                               | [`200`] - Successful venue update.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                    |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/venue/{venueId}`                                             | Delete a venue by venue id.                                                                                                                                                     | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue.                                                                                                                                                                                                                 | [`200`] - Successful venue deletion.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`404`] - Venue not found. <br> [`500`] Internal server error.   |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/venue/{venueId}/reaction`                                    | Create a new reaction on a venue by venue id. Body should contain necessary fields for reaction.                                                                                | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> ...all reaction fields                                                                                                                                                                                 | [`201`] - Successful venue creation.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                   |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/venue/{venueId}/reaction/?userId={userId}&emoji={emoji}`     | Delete a reaction for a specific venue id made a specific user id. Body should only contain emoji to be deleted since user can only have one reaction for each emoji per venue. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user (query param). <br><br> `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> `emoji` (string) - The string representation of the emoji of the reaction to be deleted. | [`201`] - Successful venue creation.<br> [`400`] - Venue not found.<br> [`400`] - Reaction not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error. |

# Current Tasks List
---
- Delete user ✅
- Update venue ✅
- Save group post ✅
- Save group delete ✅
- Refactor user for group invitations ✅
- Invite member to group post ✅
- Invite member group delete ✅
- Accept invitation to group patch ✅
- Delete user from group (leave group) TODO
- Get venues (with pagination - get 10 at a time) ✅
- Refactor for receivedFriendRequests ✅
- Send friend request (post) ✅
- Accept friend request (post) ✅
- Upload profile image (use queue) ✅
- Replace profile image (use queue) ✅
- Delete profile image (use queue)
- Upload cover image (use queue) 
- Replace cover image (use queue)
- Delete cover image (use queue)
- Reaction expire ✅
- Group expire ✅
- Notifications 💀 (use queue) ✅
