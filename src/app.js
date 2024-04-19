import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express();

// setting up the cors origin
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// accepting the json in the request body and limiting the json size (inside request body) to prevent the server from extra load
app.use(express.json({
    limit: "16kb",
}))

// encoding the special characters in the requested url to retrieve the data from the url and let express understand it
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

// storing the files like favicon, pdf, images that is intended to be stored in a public like folder (to be accessed publicly). public is the folder name below
app.use(express.static("public"))

// let us perfrom the crud operation on cookies in the user's browser from the server
app.use(cookieParser())

export { app }