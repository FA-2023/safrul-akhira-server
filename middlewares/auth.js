const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
require("dotenv").config();

exports.validateSignup = async (req, res, next) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    phone,
    role,
    cnicFront,
    cnicBack,
  } = req.body;

  // check required data
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "username, email, password & confirmPassword are required",
      status: 400,
    });
  }
  // check passwords
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "password & confirmPassword are not the same",
      status: 400,
    });
  }

  // phone is required for vendor
  if (role === "vendor" && !phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required for the vendor registration.",
      status: 400,
    });
  }

  // cnic is required for vendor
  if (role === "vendor" && (!cnicFront || !cnicBack)) {
    return res.status(400).json({
      success: false,
      message:
        "`cnicFront` & `cnicBack` are required for the vendor registration.",
      status: 400,
    });
  }

  // proceed
  next();
};

exports.auth = async (req, res, next) => {
  const token = req.header("token");
  if (!token) {
    return res
      .status(400)
      .json({ success: false, status: 400, message: "token is missing" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err)
        return res.status(401).json({
          success: false,
          status: 401,
          message: "You have run out of time!...Kindly log in again.",
        });
      const { id } = jwt.decode(token);
      const user = await User.findOne({ _id: id });
      if (!user)
        return res
          .status(401)
          .json({ success: false, status: 401, message: `User not found` });
      req.user = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      req.token = token;
      return next();
    });
  } catch (err) {
    console.log("🚀 ~ file: auth.js ~ line 36 ~ exports.auth= ~ err", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.checkAccess = async (req, res, next) => {
  const { user } = req;
  if (user?.role == "vendor" || user?.role == "admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    status: 403,
    message: "Access denied",
  });
};
