const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;

const imageUrl = `${process.env.SERVER_ROOT}/uploads/images/categories/`;

const imageSchema = new Schema({
  url: { type: String, trim: true, default: "" },
  alt: { type: String, default: "" },
});

const productSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: "User", default: null },
  category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  name: { type: String, required: true },
  // slug: { type: String, required: true, trim: true, unique: true },
  price: { type: Number, default: 0 },
  address: { type: String, default: "" },
  shortDescription: { type: String, default: "" },
  longDescription: { type: String, default: "" },
  images: [],
  isDeleted: { type: Boolean, default: false },
  addedOn: { type: Date, default: Date.now() },
  updatedOn: { type: Date, default: Date.now() },
});

productSchema.virtual("imageUrl").get(function () {
  return `${imageUrl}${this.image}`;
});

// productSchema.path("slug").validate(async (value) => {
//   try {
//     const product = mongoose.model("Product");

//     const count = await product.countDocuments({ slug: value });
//     if (count > 0) return false;

//     return true;
//   } catch (error) {
//     return false;
//   }
// }, "product with the given Slug already exists, try some other slug.");

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
