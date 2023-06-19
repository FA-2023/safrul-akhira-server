const express = require("express");
const {
  placeOrder,
  getMyOrders,
  getVendorOrders,
  completeOrder,
  getCompletedOrders,
  getPendingOrders,
} = require("../controllers/Order.controller");
const { auth, checkAccess } = require("../middlewares/auth");

const router = express.Router();

router.use(auth);

router.post("/place", placeOrder);
router.get("/getMyOrders", getMyOrders);
// vendor orders
router.get("/getVendorOrders", checkAccess, getVendorOrders);
router.post("/completeOrder", checkAccess, completeOrder);
router.get("/getCompletedOrders", checkAccess, getCompletedOrders);
router.get("/getPendingOrders", checkAccess, getPendingOrders);

module.exports = router;
