const Category = require("../models/Category.model");
const fs = require("fs");
const path = require("path");

exports.addCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      successL: false,
      status: 400,
      message: "Category name is required!",
    });
  }

  // save image

  // create image name
  const fileSlugName = req.body.name
    ?.replace(/[^a-zA-Z0-9-_]/g, "")
    ?.toLowerCase();

  // file extension
  const ext = getExtension(req.file.originalname);

  // image path
  const imagePath = path.join(
    __dirname,
    "../uploads/images/categories",
    `${fileSlugName}.${ext}`
  );

  // file buffer
  const fileData = fs.readFileSync(req.file.path);

  // save file
  fs.writeFile(imagePath, fileData, "binary", function (err) {
    if (err) throw err;
    console.log("File saved.");
  });
  // remove temp file
  fs.unlinkSync(req.file.path);

  const category = new Category({
    name,
    slug: generateSlug(name),
    image: `${fileSlugName}.${ext}`,
  });
  try {
    const doc = await category.save();
    return res.status(201).json({
      success: true,
      status: 201,
      message: "Data saved successfully",
      data: doc,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: err,
      message: "An error occured while save data",
    });
  }
};

exports.getAllCategories = async (req, res) => {
  const docs = await Category.find({ isDeleted: false }).exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: docs,
  });
};

exports.getCategory = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Category id is missing!",
    });
  }

  const query = { _id: id, isDeleted: false };

  const doc = await Category.findOne(query).exec();

  if (!doc)
    return res.status(404).json({
      success: false,
      status: 404,
      message: "Category not found or may have been deleted.",
    });
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: doc,
  });
};

exports.updateCategory = async (req, res) => {
  const { id, ...rest } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Category id is missing!",
    });
  }

  const query = { _id: id, isDeleted: false };
  const update = { $set: { ...rest } };

  Category.findOneAndUpdate(query, update, { new: true })
    .then((doc) => {
      if (!doc)
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Category not found or may have been deleted.",
        });
      return res.status(200).json({
        success: true,
        status: 200,
        message: "category updated successfully",
        data: doc,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occured while updating the category.",
        error: err,
      });
    });
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Category id is missing!",
    });
  }

  const query = { _id: id, isDeleted: false };
  const update = { $set: { isDeleted: true } };

  Category.findOneAndUpdate(query, update, { new: true })
    .then((doc) => {
      if (!doc)
        return res.status(404).json({
          success: false,
          status: 404,
          message: "Category not found or have already been deleted.",
        });
      return res.status(200).json({
        success: true,
        status: 200,
        message: "category deleted successfully",
        data: doc,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
        status: 500,
        message: "An error occured while deleting the category.",
        error: err,
      });
    });
};

const getExtension = (filename) => {
  return filename.split(".").pop();
};

const generateSlug = (name) => {
  return name.replace(/[^a-zA-Z0-9-_]/g, "")?.toLowerCase();
};
