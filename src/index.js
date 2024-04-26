import dotenv from "dotenv";
import connectToDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

// Calling the function for mongoDB connection
connectToDB()
  .then(() => {
    // listening on the app
    app.on("error", (error) => {
      console.log("Error encountered at app.on() listener", error);
      throw error;
    });

    app.listen(process.env.PORT || 8000, () => {
      // console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed!!! ", error);
  });
