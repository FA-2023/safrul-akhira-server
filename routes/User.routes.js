const express = require("express");
const { signup, login } = require("../controllers/User.controller");
const { validateSignup } = require("../middlewares/auth");

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", login);

module.exports = router;
