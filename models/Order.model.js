const mongoose = require("mongoose");
require("dotenv").config();
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    vendor: { type: Schema.Types.ObjectId, ref: "User", default: null },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, default: 0 },
    address: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    longDescription: { type: String, default: "" },
    status: { type: String, default: "pending" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function () {
  try {
    const product = mongoose.model("Product");

    const doc = await product.findOne({ _id: this.product });
    this.amount = doc.price * this.quantity;
    return this;
  } catch (error) {
    return false;
  }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
