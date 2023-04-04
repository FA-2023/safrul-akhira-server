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
    "../uploads/images/services",
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

  const service = new Service({
    name,
    slug: generateSlug(name),
    image: `${fileSlugName}.${ext}`,
  });
  try {
    const doc = await service.save();
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

exports.getAllServices = async (req, res) => {
  const docs = await Service.find({}).exec();
  return res.status(200).json({
    success: true,
    status: 200,
    message: "",
    data: docs,
  });
};

const getExtension = (filename) => {
  return filename.split(".").pop();
};

const generateSlug = (name) => {
  return name.replace(/[^a-zA-Z0-9-_]/g, "")?.toLowerCase();
};
