const express = require("express");
const {
  addService,
  getAllServices,
} = require("../controllers/Service.controller");
const { auth, checkAccess } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/add", auth, checkAccess, upload.single("image"), addService);
router.get("/get-all", getAllServices);

module.exports = router;
