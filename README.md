# nightlight (backend)
This is the backend for the nightlight app. It is a RESTful API built with Node.js and Express.js. It uses MongoDB as its database.

# API Endpoints
| HTTP Method | Name | Description | Parameters | Responses |
| - | - | - | - | - |
| ![POST](https://img.shields.io/badge/-POST-green) | `/user` | Create a user. | ...all user fields | [`201`] Successful user creation. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] User not found. <br> [`500`] Internal server error. |
| ![GET](https://img.shields.io/badge/-GET-blue) | `/user/:userId` | Get a single user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user retrieval. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| ![PUT](https://img.shields.io/badge/-PUT-orange) | `/user` | Update a user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user update. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| ![DELETE](https://img.shields.io/badge/-DELETE-red) | `/user` | Delete a user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user deletion. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-POST-green) | `/group` | Create a group. | ...all group fields | [`201`] - Successful group creation. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-GET-blue) | `/group/:groupId` | Get a single group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group retrieval. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-PUT-orange) | `/group` | Update a group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group update. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-DELETE-red) | `/group` | Delete a group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group deletion. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-POST-green) | `/venue` | Create a venue. | ...all venue fields | [`201`] - Successful venue creation. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-GET-blue) | `/venue/:venueId` | Get a single venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue retrieval. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-PUT-orange) | `/venue` | Update a venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue update. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| ![POST](https://img.shields.io/badge/-DELETE-red) | `/venue` | Delete a venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue deletion. <br> [`400`] Bad request. <br> [`401`] Unauthroized. idk who u r. <br> [`403`] Forbidden. ik who u r...nice try ;). <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |

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
