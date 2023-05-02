const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;

const imageUrl = `${process.env.SERVER_ROOT}/uploads/images/categories/`;

const imageSchema = new Schema({
  url: { type: String, trim: true, default: "" },
  alt: { type: String, default: "" },
});

const categorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, trim: true, unique: true },
  shortDescription: String,
  longDescription: String,
  image: { type: String, trim: true },
  isDeleted: { type: Boolean, default: false },
});

categorySchema.virtual("imageUrl").get(function () {
  return `${imageUrl}${this.image}`;
});

categorySchema.path("slug").validate(async (value) => {
  try {
    const category = mongoose.model("Category");

    const count = await category.countDocuments({ slug: value });
    if (count > 0) return false;

    return true;
  } catch (error) {
    return false;
  }
}, "category with the given Slug already exists, try some other slug.");

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
