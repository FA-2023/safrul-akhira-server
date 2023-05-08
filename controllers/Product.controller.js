const Product = require("../models/Product.model");
const fs = require("fs");
const path = require("path");

exports.addProduct = async (req, res) => {
  const { name, price, vendorId, categoryId, images, ...rest } = req.body;
  if (!name || !vendorId || !categoryId || !price) {
    return res.status(400).json({
      successL: false,
      status: 400,
      message: "Product name, price, vendorId & categoryId are required!",
    });
  }

  if (!images && !images.length) {
    return res.status(400).json({
      successL: false,
      status: 400,
      message: "At least one product image is required!",
    });
  }
  // if (!req.files && !req.files.length) {
  //   return res.status(400).json({
  //     successL: false,
  //     status: 400,
  //     message: "At least one product image is required!",
  //   });
  // }

  // save images //
  const filenames = saveProductImages(images, name);

  const product = new Product({
    vendor: vendorId,
    category: categoryId,
    name,
    images: filenames,
    ...rest,
  });
  try {
    const doc = await product.save();
    return res.status(201).json({
      success: true,
      status: 201,
      message: "Product added successfully",
      data: doc,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: err,
      message: "An error occured while adding product",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  const docs = await Product.find({ isDeleted: false })
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: docs,
  });
};

exports.getLatestProducts = async (req, res) => {
  const docs = await Product.find({ isDeleted: false })
    .sort({ addedOn: -1 })
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .limit(12)
    .exec();

  const favourites = req.session?.favourites || [];

  const favs = await Product.find({
    _id: { $in: favourites },
    isDeleted: false,
  })
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: { latest: docs, favourites: favs },
  });
};

exports.getProductsByCategory = async (req, res) => {
  const { categoryId } = req.body;

  if (!categoryId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "categoryId is missing!",
    });
  }

  const docs = await Product.find({ category: categoryId, isDeleted: false })
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: docs,
  });
};

exports.getVendorProducts = async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "vendorId is missing!",
    });
  }

  const docs = await Product.find({ vendor: vendorId, isDeleted: false })
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: docs,
  });
};

exports.getProduct = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Product id is missing!",
    });
  }

  const query = { _id: id, isDeleted: false };

  const doc = await Product.findOne(query)
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .exec();

  if (!doc)
    return res.status(404).json({
      success: false,
      status: 404,
      message: "Product not found or may have been deleted.",
    });
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: doc,
  });
};

exports.addToFavourite = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Product id is missing!",
    });
  }
  const favourites = req.session?.favourites || [];
  favourites.push(id);

  req.session.favourites = favourites;

  return res.status(200).json({
    success: true,
    status: 200,
    message: "Product added to favourites.",
  });
};

exports.getFavourites = async (req, res) => {
  const favourites = req.session?.favourites || [];

  const docs = await Product.find({
    _id: { $in: favourites },
    isDeleted: false,
  })
    .populate([
      { path: "vendor", select: "-password -role -isDeleted -isActive" },
      { path: "category", select: "-isDeleted" },
    ])
    .exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: docs,
  });
};

exports.updateProduct = async (req, res) => {
  const { id, ...rest } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Product id is missing!",
    });
  }

  // if (req.files && req.files.length) {
  //   // save images //
  //   const filenames = saveProductImages(req.files, Date.now());
  //   rest.images
  // }

  const query = { _id: id, isDeleted: false };
  const update = { $set: { ...rest } };

  Product.findOneAndUpdate(query, update, { new: true })
    .then((doc) => {
      if (!doc)
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Product not found or may have been deleted.",
        });
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Product updated successfully",
        data: doc,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occured while updating the Product.",
        error: err,
      });
    });
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Product id is missing!",
    });
  }

  const query = { _id: id, isDeleted: false };
  const update = { $set: { isDeleted: true } };

  Product.findOneAndUpdate(query, update, { new: true })
    .then((doc) => {
      if (!doc)
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Product not found or have already been deleted.",
        });
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Product deleted successfully",
        data: doc,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occured while deleting the Product.",
        error: err,
      });
    });
};

const getExtension = (filename) => {
  return filename.split(".").pop();
};

const saveProductImages = (files = [], name) => {
  // create image name
  const fileSlugName = name?.replace(/[^a-zA-Z0-9-_]/g, "")?.toLowerCase();

  const filenames = [];

  files.forEach((file, idx) => {
    // file extension
    const ext = "png";

    // append image name for saving
    filenames.push(`${fileSlugName}-${idx + 1}.${ext}`);

    // image path
    const imagePath = path.join(
      __dirname,
      "../uploads/images/products",
      `${fileSlugName}-${idx + 1}.${ext}`
    );

    var bitmap = new Buffer.from(file, "base64");
    // var bitmap = new Buffer(file, "base64");
    // write buffer to file
    fs.writeFileSync(imagePath, bitmap, function (err) {
      if (err) throw err;
      console.log("File saved.");
    });

    // file buffer
    // const fileData = fs.readFileSync(file, { encoding: "base64" });

    // // save file
    // fs.writeFile(imagePath, fileData, "binary", function (err) {
    //   if (err) throw err;
    //   console.log("File saved.");
    // });
    // remove temp file
    // fs.unlinkSync(file.path);
  });
  // // create image name
  // const fileSlugName = name?.replace(/[^a-zA-Z0-9-_]/g, "")?.toLowerCase();

  // const filenames = [];

  // files.forEach((file, idx) => {
  //   // file extension
  //   const ext = getExtension(file.originalname);

  //   // append image name for saving
  //   filenames.push(`${fileSlugName}-${idx + 1}.${ext}`);

  //   // image path
  //   const imagePath = path.join(
  //     __dirname,
  //     "../uploads/images/products",
  //     `${fileSlugName}-${idx + 1}.${ext}`
  //   );

  //   // file buffer
  //   const fileData = fs.readFileSync(file.path);

  //   // save file
  //   fs.writeFile(imagePath, fileData, "binary", function (err) {
  //     if (err) throw err;
  //     console.log("File saved.");
  //   });
  //   // remove temp file
  //   fs.unlinkSync(file.path);
  // });

  return filenames;
};

const generateSlug = (name) => {
  return name.replace(/[^a-zA-Z0-9-_]/g, "")?.toLowerCase();
};
