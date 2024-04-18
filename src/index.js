import dotenv from "dotenv";
import connectToDB from "./db/index.js";

dotenv.config()

// Calling the function for mongoDB connection
connectToDB();