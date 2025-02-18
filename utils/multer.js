const multer = require("multer");
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});


const storage = multer.memoryStorage(); // Store file in memory before uploading to ImageKit
const upload = multer({ storage });

module.exports = { upload, imagekit };