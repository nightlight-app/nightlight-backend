import { Server } from 'socket.io';
import { connectMongoDB } from './config/mongodb';
import { LocationService } from './sockets';
import createServer from './server';

const PORT = 6060;

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
httpServer.listen(PORT, () => {
  console.log(`Express server is listening on port ${PORT}!`);
});

// Export the server instance to allow use elsewhere
export default locationService;
