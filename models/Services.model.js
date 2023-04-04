const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: { type: String, trim: true, default: "" },
  alt: { type: String, default: "" },
});

const serviceSchema = new Schema({
  name: { type: String, required: true },
  shortDescription: String,
  longDescription: String,
  image: { type: String, trim: true },
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
