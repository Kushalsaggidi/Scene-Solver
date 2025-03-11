const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  imageName: String,
  imageUrl: String,
});

const Image = mongoose.model("uploads", ImageSchema);

module.exports = Image;
