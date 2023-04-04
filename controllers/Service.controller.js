const Service = require("../models/Services.model");
const fs = require("fs");
const path = require("path");
// const { checkAccess } = require("../middlewares/auth");

exports.addService = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      successL: false,
      status: 400,
      message: "Service name is required!",
    });
  }
  const files = req.files;
};

exports.getAllServices = async (req, res) => {};
