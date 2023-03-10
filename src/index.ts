import { Server } from 'socket.io';
import { connectMongoDB } from './config/mongodb.config';
import { LocationService } from './sockets';
import { configureCloudinary } from './config/cloudinary.config';
import createServer from './server';

const PORT = 6060;

// Connect to MongoDB
connectMongoDB();

// Configure Cloudinary
configureCloudinary();

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
