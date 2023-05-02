const express = require("express");
const {
  addProduct,
  getAllProducts,
  getLatestProducts,
  getProductsByCategory,
  getVendorProducts,
  getProduct,
  addToFavourite,
  getFavourites,
  updateProduct,
  deleteProduct,
} = require("../controllers/Product.controller");
const { auth, checkAccess } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/add", auth, checkAccess, upload.array("images", 12), addProduct);
router.get("/get-all", getAllProducts);
router.get("/get-latest", getLatestProducts);
router.post("/get-by-category", getProductsByCategory);
router.post("/get-by-vendor", getVendorProducts);
router.post("/get-by-id", getProduct);
router.post("/add-to-fav", addToFavourite);
router.get("/get-favourites", getFavourites);
router.put(
  "/update-by-id",
  auth,
  checkAccess,
  upload.array("images", 12),
  updateProduct
);
router.delete("/delete-by-id", auth, checkAccess, deleteProduct);

module.exports = router;
