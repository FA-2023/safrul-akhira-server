const Order = require("../models/Order.model");

exports.placeOrder = async (req, res) => {
  const {
    vendorId,
    productId,
    // userId,
    quantity = 1,
    address,
    shortDescription,
    longDescription,
  } = req.body;

  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Session expired, please login to place an order.",
    });
  }

  if (!vendorId || !productId || !userId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "vendorId, productId & userId are required!",
    });
  }

  try {
    const doc = await Order.create({
      vendor: vendorId,
      product: productId,
      user: userId,
      quantity,
      address,
      shortDescription,
      longDescription,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Order placed successfully!",
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occured while saving the order data",
      error,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Session expired, please login to place an order.",
    });
  }

  try {
    const docs = await Order.find({
      user: userId,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    // throw error;
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occured while fetching the orders",
      error,
    });
  }
};

exports.getVendorOrders = async (req, res) => {
  const vendorId = req.user?.id;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Session expired, please login to place an order.",
    });
  }

  try {
    const docs = await Order.find({
      vendor: vendorId,
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    // throw error;
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occured while fetching the orders",
      error,
    });
  }
};

exports.completeOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Please provide an order id.",
    });
  }

  try {
    const doc = await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      { status: "completed" },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Orders status changed successfully!",
      data: doc,
    });
  } catch (error) {
    // throw error;
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occured while completing the order",
      error,
    });
  }
};

exports.getCompletedOrders = async (req, res) => {
  const vendorId = req.user?.id;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Session expired, please login to place an order.",
    });
  }

  try {
    const docs = await Order.find({
      vendor: vendorId,
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    // throw error;
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occured while fetching the orders",
      error,
    });
  }
};

exports.getPendingOrders = async (req, res) => {
  const vendorId = req.user?.id;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Session expired, please login to place an order.",
    });
  }

  try {
    const docs = await Order.find({
      vendor: vendorId,
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Orders fetched successfully!",
      count: docs.length,
      data: docs,
    });
  } catch (error) {
    // throw error;
    return res.status(500).json({
      success: false,
      status: 500,
      message: "An error occured while fetching the orders",
      error,
    });
  }
};
