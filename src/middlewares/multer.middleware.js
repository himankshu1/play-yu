import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // saving the file temporarily in the server's temp folder. cb = callback
    cb(
      null,
      "/Users/himannshukumar/Desktop/mern apps/play-yu/server/public/temp"
    );
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage: storage });
