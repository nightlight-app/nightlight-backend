import { Server, Socket } from 'socket.io';

/**
 * Implement listener for incoming location data.
 *
 * Location data will be inserted into the database.
 *
 * Location will be an object with the following properties:
 *  - latitude: number
 *  - longitude: number
 * @param socket Socket.io socket
 */
const addLocationListener = (socket: Socket) => {
  socket.on('location', arg => {
    console.log('Location received!', arg);
  });
};

/**
 * Implement listener for incoming socket.io connections
 * @param io Socket.io server
 */
export default function addConnectionEventListener(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Socket.io connected!');

    addLocationListener(socket);
  });
}
