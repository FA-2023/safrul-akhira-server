const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: { type: String, trim: true, default: "" },
  alt: { type: String, default: "" },
});

const serviceSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, trim: true, unique: true },
  shortDescription: String,
  longDescription: String,
  image: { type: String, trim: true },
});

serviceSchema.path("slug").validate(async (value) => {
  try {
    const service = mongoose.model("Service");

    const count = await service.countDocuments({ slug: value });
    if (count > 0) return false;

    return true;
  } catch (error) {
    return false;
  }
}, "service with the given Slug already exists, try some other slug.");

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
