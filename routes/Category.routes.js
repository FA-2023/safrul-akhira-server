const express = require("express");
const {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/Category.controller");
const { auth, checkAccess } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/add", auth, checkAccess, upload.single("image"), addCategory);
router.get("/get-all", getAllCategories);
router.post("/get-by-id", getCategory);
router.put("/update-by-id", auth, checkAccess, updateCategory);
router.delete("/delete-by-id", auth, checkAccess, deleteCategory);

module.exports = router;
