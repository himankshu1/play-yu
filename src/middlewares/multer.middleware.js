import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // saving the file temporarily in the server's temp folder. cb = callback
    cb(null, "../../public/temp");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
