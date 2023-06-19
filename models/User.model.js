const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    profilePic: {
      type: String,
      default: "",
    },
    cnicFront: {
      type: String,
      default: "",
    },
    cnicBack: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "customer",
      enum: ["admin", "customer", "vendor", "guest", "user"],
    },
    cnic: String,
    address: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { toJSON: { virtuals: true } }
);

// virtual
userSchema
  .virtual("planPassword")
  .set(async function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.planPassword = await bcrypt.hash(password, 10);
  })
  .get(function () {
    return this._password;
  });

userSchema.virtual("profilePicUrl").get(function () {
  return `https://safrul-akhira.onrender.com/uploads/images/users/${this.profilePic}`;
});

// methods
userSchema.methods = {
  authenticate: async function (plainPW) {
    const match = await bcrypt.compare(plainPW, this.password);
    return match;
  },

  encryptPassword: async function (password) {
    if (!password) return "";
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      return hashedPassword;
    } catch (err) {
      return "";
    }
  },

  generateToken: function (data) {
    const token = jwt.sign({ ...data }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    return token;
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

module.exports = mongoose.model("User", userSchema);
