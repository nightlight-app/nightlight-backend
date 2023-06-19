import { connectMongoDB } from './config/mongodb.config';
import { LocationService } from './sockets';
import { configureCloudinary } from './config/cloudinary.config';
import createServer from './server';
import { Server } from 'socket.io';

// Connect to MongoDB
connectMongoDB();

// Configure Cloudinary
configureCloudinary();

// Set up Bull Board when running in production
const shouldRunBullBoard = true;

// Create the server
const httpServer = createServer({ shouldRunBullBoard });

// Create the socket.io server
const io = new Server(httpServer);

// Initialize socket.io services
const locationService = new LocationService(io);
locationService.initialize();

// Start the server
httpServer.listen(process.env.SERVER_PORT, () => {
  console.log(`Express server is listening on port ${process.env.SERVER_PORT}!`);

  if (shouldRunBullBoard) {
    console.log(
      `Bull-board is available at: http://localhost:${process.env.SERVER_PORT}/bull-board`
    );
  }
});
