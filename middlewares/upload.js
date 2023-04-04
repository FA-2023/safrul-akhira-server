const multer = require("multer");
const path = require("path");

const validTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/svg+xml",
  "image/gif",
  "image/webp",
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/tmp"));
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  console.log(file);
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(
      new Error(
        "Please provide a valid image, allowed types are jpeg, jpg, png, svg, gif & webp"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
