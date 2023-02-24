# nightlight (backend)

This is the backend for the nightlight app. It is a RESTful API built with Node.js and Express.js. It uses MongoDB as its database.

# API Endpoints

| HTTP Method                                               | Name                                                       | Description                                                                                                                                                                     | Parameters                                                                                                                                                                                                                                                                                               | Responses                                                                                                                                                                                                                                                    |
|-----------------------------------------------------------|------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ![POST](https://img.shields.io/badge/-POST-green)         | `/user`                                                    | Create a user.                                                                                                                                                                  | ...all user fields                                                                                                                                                                                                                                                                                       | [`201`] Successful user creation.  <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                                                    |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/user/?userId={userId}`                                   | Get a single user by id. Body contains necessary fields for user.                                                                                                               | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. (optional)                                                                                                                                                                                                        | [`200`] - Successful user retrieval. <br> [`400`] User not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Bad Request <br> [`500`] Internal server error.                                   |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/user/{userId}`                                           | Update a user document. Body contains fields to update.                                                                                                                         | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> ...all new user fields.                                                                                                                                                                                  | [`200`] - Successful user update.  <br> [`400`] User not found.<br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                       |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/user/{userId}`                                           | Delete a user. (NOT IMPLEMENTED YET)                                                                                                                                            | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user.                                                                                                                                                                                                                   | [`200`] - Successful user deletion. <br> [`400`] User not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                      |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/group`                                                   | Create a group. Body should contain necessary field for group.                                                                                                                  | ...all group fields                                                                                                                                                                                                                                                                                      | [`201`] - Successful group creation. <br> [`404`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error.                                                                 |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/group/?groupId={groupId}`                                | Get a single group by group id.                                                                                                                                                 | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group.                                                                                                                                                                                                                 | [`200`] - Successful group retrieval.<br> [`400`] - Group not found.  <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen) | `/group/{groupId}`                                         | Replace a group document entirely.                                                                                                                                              | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. <br><br> ...all new group fields.                                                                                                                                                                               | [`200`] - Successful group update.<br> [`400`] - Group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                    |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/group/{groupId}`                                         | Delete a group.                                                                                                                                                                 | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group.                                                                                                                                                                                                                 | [`200`] - Successful group deletion.<br> [`400`] - Group not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                  |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/venue`                                                   | Create a venue. Should only be called for testing purposes. Body contains all necessary fields for venue.                                                                       | ...all venue fields                                                                                                                                                                                                                                                                                      | [`201`] - Successful venue creation. <br> [`404`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error.                                                                 |
| ![GET](https://img.shields.io/badge/-GET-blue)            | `/venue/?venueId={venueId}`                                | Get a single venue by venue id.                                                                                                                                                 | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. (optional)                                                                                                                                                                                                      | [`200`] - Successful venue retrieval.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                 |
| ![PATCH](https://img.shields.io/badge/-PATCH-yellowgreen)          | `/venue/{venueId}`                                         | Update a venue document. Body should contain fields to be replaced. Do not use for any reaction logic. (NOT IMPLEMENTED YET)                                                    | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> ...all new venue feilds.                                                                                                                                                                               | [`200`] - Successful venue update.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] Bad request. <br> [`500`] Internal server error.                                    |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/venue/{venueId}`                                         | Delete a venue by venue id.                                                                                                                                                     | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue.                                                                                                                                                                                                                 | [`200`] - Successful venue deletion.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`404`] - Venue not found. <br> [`500`] Internal server error.   |
| ![POST](https://img.shields.io/badge/-POST-green)         | `/venue/{venueId}/reaction`                                | Create a new reaction on a venue by venue id. Body should contain necessary fields for reaction.                                                                                | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> ...all reaction fields                                                                                                                                                                                 | [`201`] - Successful venue creation.<br> [`400`] - Venue not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error.                                   |
| ![DELETE](https://img.shields.io/badge/-DELETE-red)       | `/venue/{venueId}/reaction/?userId={userId}&emoji={emoji}` | Delete a reaction for a specific venue id made a specific user id. Body should only contain emoji to be deleted since user can only have one reaction for each emoji per venue. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user (query param). <br><br> `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> `emoji` (string) - The string representation of the emoji of the reaction to be deleted. | [`201`] - Successful venue creation.<br> [`400`] - Venue not found.<br> [`400`] - Reaction not found. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;).<br> [`404`] Bad request. <br> [`500`] Internal server error. |






# Models

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
    "creationTime": Date,
    "expirationDate": Date,
    "returnTime": Date,
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

## TODO
- Delete user
- Update venue
- Save group post
- Save group delete
- Refactor user for group invitations
- Invite member to group post
- Invite member group delete
- Accept invitation to group post
- Delete user from group (leave group)
- Get venues (with pagination - get 10 at a time)
- Refactor for sentFriendRequests and receivedFriendRequests
- Send friend request (post)
- Accept friend request (post)
- Upload profile image (use queue)
- Replace profile image (use queue)
- Delete profile image (use queue)
- Upload cover image (use queue)
- Replace profile image (use queue)
- Delete profile image (use queue)
- Reaction expire (use queue)
- Group expire (use queue)
- Notifications 💀 (use queue)

