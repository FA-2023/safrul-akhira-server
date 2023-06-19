const express = require("express");
const {
  signup,
  login,
  getMyProfile,
} = require("../controllers/User.controller");
const { validateSignup, auth } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", login);
router.get("/getMyProfile", auth, getMyProfile);

module.exports = router;
