const ImageKit = require("imagekit"); // Import ImageKit SDK
const {v4:uuid} = require("uuid");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY, // Ensure this is set in your environment variables
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // Ensure this is set in your environment variables
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT // Ensure this is set in your environment variables
});

module.exports.uploadImageToImageKit = async (file, folder) => {
    try {
        const result = await imagekit.upload({
            file: file.toString("base64"), // Convert buffer to base64
            fileName: uuid(),
            folder: 'bionova'+folder // Optional: specify a folder
        });
        return result.url; // Return the URL of the uploaded image
    } catch (error) {
        throw error; // Rethrow the error to be handled by the caller
    }
};






