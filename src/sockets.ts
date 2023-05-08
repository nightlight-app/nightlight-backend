import { Server, Socket } from 'socket.io';

interface LocationUpdateData {
  groupId: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export class LocationService {
  // the socket.io server
  #io: Server;

  constructor(io: Server) {
    this.#io = io;
  }

  /**
   * Implement listener for incoming socket.io connections
   * @param io Socket.io server
   */
  initialize() {
    // Listen for incoming socket.io connections
    this.#io.on('connection', (socket: Socket) => {
      console.log('A socket.io client is connected:', socket.id);

      // listen for the joinGroup event
      socket.on('joinGroup', (groupId: string) => {
        socket.join(groupId);
        this.#io
          .in(groupId)
          .fetchSockets()
          .then(socketsInRoom => {
            console.log(
              `${socket.id} has joined the group [${groupId}]. # of members: ${socketsInRoom.length}`
            );
          });
      });

      // listen for the leaveGroup event
      socket.on('leaveGroup', (groupId: string) => {
        socket.leave(groupId);
        this.#io
          .in(groupId)
          .fetchSockets()
          .then(socketsInRoom => {
            console.log(
              `${socket.id} has left the group [${groupId}]. Remaining members: ${socketsInRoom.length}`
            );
          });
      });

      // listen for the locationUpdate event
      socket.on('locationUpdate', (arg: LocationUpdateData) => {
        const { groupId, userId, location } = arg;
        if (
          groupId === undefined ||
          userId === undefined ||
          location === undefined
        ) {
          return;
        }
        // console.log(
        //   `[${groupId}] [${userId}] [${location.latitude}, ${location.longitude}]`
        // );
        // broadcast the location to all members of the group
        this.#io.to(groupId).emit('broadcastLocation', {
          userId: arg.userId,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        });
      });
    });
  }
}
