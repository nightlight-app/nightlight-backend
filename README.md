# nightlight (backend)
This is the backend for the nightlight app. It is a RESTful API built with Node.js and Express.js. It uses MongoDB as its database.

# API Endpoints
| HTTP Method | Name | Description | Parameters | Responses |
| - | - | - | - | - |
| ![POST](https://img.shields.io/badge/-POST-green) | `/user` | Create a user. Only called upon user account creation. | ...all user fields | [`201`] Successful user creation. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error. |
| ![GET](https://img.shields.io/badge/-GET-blue) | `/user/?id={userId}&email={email}&phone={phoneNum}` | Get a single user (or all users). Called upon user login and any other time all information attached to a user is needed. The user's ID and/or email and/or phone number may be passed as filters. If no parameters are given, returns all users. | `id` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. (optional) <br> `email` (string) - The email address attached to the target user. (optional) <br> `phoneNum` (string) - The phone number attached to the target user. (optional) | [`200`] - Successful user retrieval. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| ![PUT](https://img.shields.io/badge/-PUT-orange) | `/user/{userId}` | Replace a user document entirely. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. <br><br> ...all new user fields. | [`200`] - Successful user update. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| ![DELETE](https://img.shields.io/badge/-DELETE-red) | `/user/{userId}` | Delete a user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user deletion. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-POST-green) | `/group` | Create a group. Called when a user presses the 'Create' button on the 'New Group' modal. Handles all potential errors and validation such as checking the 'group status' of each member in the new group. | ...all group fields | [`201`] - Successful group creation. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error. |
| ![GET](https://img.shields.io/badge/-GET-blue) | `/group/?id={groupId}` | Get a single group (or all groups). Called upon user login and any other time all information attached to a group is needed. The group's ID may be passed as a filter. If no ID is given, returns all groups. | `id` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group retrieval. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![PUT](https://img.shields.io/badge/-PUT-orange) | `/group/{groupId}` | Replace a group document entirely. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. <br><br> ...all new group fields. | [`200`] - Successful group update. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![DELETE](https://img.shields.io/badge/-DELETE-red) | `/group/{groupId}` | Delete a group. Called when a group is disbanned, expires, or all members leave a group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group deletion. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-POST-green) | `/venue` | Create a venue. Called when new venues should be added to the database. | ...all venue fields | [`201`] - Successful venue creation. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`500`] Internal server error. |
| ![GET](https://img.shields.io/badge/-GET-blue) | `/venue/?id={venueId}` | Get a single venue (or all venues). If no ID is given, returns all venues. | `id` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. (optional) | [`200`] - Successful venue retrieval. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| ![PUT](https://img.shields.io/badge/-PUT-orange) | `/venue/{venueId}` | Replace a venue document entirely. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. <br><br> ...all new venue feilds. | [`200`] - Successful venue update. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| ![DELETE](https://img.shields.io/badge/-DELETE-red) | `/venue/{venueId}` | Delete a venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue deletion. <br> [`400`] Bad request. <br> [`401`] Unauthorized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |

# Models
## User
```json
{
    "_id": ObjectId("1a2b3c4d5e6f"), // MongoDB-generated UUID
}
```

## Group
```json
{
    "_id": ObjectId("1a2b3c4d5e6f"), // MongoDB-generated UUID
}
```

## Venue
```json
{
    "_id": ObjectId("1a2b3c4d5e6f"), // MongoDB-generated UUID
}
```
