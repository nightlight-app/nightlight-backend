# nightlight (backend)

<style>
    GET, POST, PUT, DELETE {
        border-radius: 5px;
        padding: 2px 10px;
        color: white;
        font-weight: bold;
    }
    GET {
        background-color: #41b1ff;
    }
    GET::before {
        content: "GET";
    }
    POST {
        background-color: #00d089;
    }
    POST::before {
        content: "POST";
    }
    PUT {
        background-color: #ff9c00;
    }
    PUT::before {
        content: "PUT";
    }
    DELETE {
        background-color: #ff1f3a;
    }
    DELETE::before {
        content: "DELETE";
    }
</style>

# API Endpoints
| HTTP Method | Name | Description | Parameters | Responses |
| - | - | - | - | - |
| <POST /> | `/user` | Create a user. | ...all user fields | [`201`] Successful user creation. <br> [`404`] User not found. <br> [`500`] Internal server error. <br> [`501`] Internal server error. |
| <GET /> | `/user/:userId` | Get a single user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user retrieval. <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| <PUT /> | `/user` | Update a user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user update. <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| <DELETE /> | `/user` | Delete a user. | `userId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target user. | [`200`] - Successful user deletion. <br> [`404`] - User not found. <br> [`500`] Internal server error. |
| <POST /> | `/group` | Create a group. | ...all group fields | [`201`] - Successful group creation. <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| <GET /> | `/group/:groupId` | Get a single group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group retrieval. <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| <PUT /> | `/group` | Update a group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group update. <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| <DELETE /> | `/group` | Delete a group. | `groupId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target group. | [`200`] - Successful group deletion. <br> [`404`] - Group not found. <br> [`500`] Internal server error. |
| <POST /> | `/venue` | Create a venue. | ...all venue fields | [`201`] - Successful venue creation. <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| <GET /> | `/venue/:venueId` | Get a single venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue retrieval. <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| <PUT /> | `/venue` | Update a venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue update. <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |
| <DELETE /> | `/venue` | Delete a venue. | `venueId` (Object ID) - The MongoDB-generated UUID (`_id`) attached to the target venue. | [`200`] - Successful venue deletion. <br> [`404`] - Venue not found. <br> [`500`] Internal server error. |

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
