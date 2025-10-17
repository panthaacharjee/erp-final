const server = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/Datebase");
const cloudinary = require("cloudinary").v2;

//DOTENV CONFIGURATION
dotenv.config({ path: "./config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(process.env.CLOUDINARY_CLOUD_NAME);

connectDB();

server.listen(process.env.PORT, () => {
  console.log(`Server is listen on ${process.env.PORT}`);
});
