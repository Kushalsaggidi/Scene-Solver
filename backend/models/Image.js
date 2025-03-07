const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  imageName: String, // Name of the image file
  imageUrl: String,  // URL or path of the image
  description: String, // Related text for the image
});

const Image = mongoose.model("Image", ImageSchema);

module.exports = Image;
