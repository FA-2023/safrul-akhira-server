const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
require("dotenv").config();

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
