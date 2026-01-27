// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("./cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => ({
//     folder: "pdf-images",
//     format: file.mimetype.split("/")[1],
//   }),
// });


// const upload = multer({ storage });
// module.exports = upload;

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

module.exports = upload;
