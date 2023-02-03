import express from "express";
import cors from "cors";

import { connectMongoDB } from "./config/mongodb";

import router from './routes/router'

const PORT = 6060;

const app = express();

connectMongoDB(); // Connect to MongoDB

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// Routers
app.use("/", router);


app.listen(PORT, () => {
    console.log(`Express server is listening on port ${PORT}!`);
});
