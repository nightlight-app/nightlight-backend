import { Server } from 'socket.io';
import { connectMongoDB } from './config/mongodb.config';
import { LocationService } from './sockets';
import createServer from './server';

// Connect to MongoDB
connectMongoDB();

// Create the server
const httpServer = createServer();

// Create the socket.io server
const io = new Server(httpServer);

// Initialize socket.io services
const locationService = new LocationService(io);
locationService.initialize();

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Express server is listening on port ${process.env.SERVER_PORT}!`
  );
});

// Export the server instance to allow use elsewhere
export default locationService;
