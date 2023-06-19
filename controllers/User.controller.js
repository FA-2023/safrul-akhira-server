const path = require("path");
const fs = require("fs");
const User = require("../models/User.model");

exports.signup = async (req, res) => {
  const {
    username,
    email,
    password,
    phone,
    role,
    profilePic,
    cnicFront,
    cnicBack,
  } = req.body;

  let IdFrontUrl, idBackUrl;

  try {
    // Check if user already exists
    const exists = await User.countDocuments({ email });

    if (exists > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already linked with a user account",
        status: 409,
      });
    }

    // Hash the password
    const user = User();
    const hashedPassword = await user.encryptPassword(password);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      role: role ? role : null,
    });

    // save user profile picture if exists
    if (profilePic) {
      const profilePicUrl = saveProfilePic(profilePic, username);
      newUser.profilePic = profilePicUrl;
    }

    // save cnic pictures
    if (role === "vendor") {
      IdFrontUrl = saveProfilePic(cnicFront, username + "_cnic_front_");
      idBackUrl = saveProfilePic(cnicBack, username + "_cnic_back_");
      newUser.cnicFront = IdFrontUrl;
      newUser.cnicBack = idBackUrl;
    }

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registeration successfull",
      user: {
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate user input
  if (!email || !password) {
    return res.status(400).send("email and password are required");
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ email, isDeleted: false });
    if (!userExists) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
        status: 401,
      });
    }

    // Compare password hashes
    const match = await userExists.authenticate(password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
        status: 401,
      });
    }

    // Generate a JWT
    const token = userExists.generateToken({
      id: userExists._id,
      username: userExists.username,
      email: userExists.email,
      role: userExists.role,
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: userExists._id,
        username: userExists.username,
        email: userExists.email,
        role: userExists.role,
      },
      message: "Login successfull",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(`Internal server error: ${error}`);
  }
};

exports.getMyProfile = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findOne({ _id: id }).select("-password");
    if (user) {
      return res.status(200).json({
        success: true,
        status: 200,
        data: user,
      });
    } else {
      return res.status(400).json({
        success: false,
        status: 400,
        message: "User not found!",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "User not found!",
    });
  }
};

function getImageExtension(base64String) {
  const regex = /^data:image\/(\w+);base64,/; // Regex pattern to match the image format
  const match = base64String.match(regex);

  if (match && match[1]) {
    return match[1]; // Return the image extension
  }
  // Return a default extension or handle error cases
  return "png"; // You can set a default extension (e.g., 'jpg') or handle error cases as needed
}

const saveProfilePic = (file = "", name) => {
  // create image name
  let fileSlugName = name?.replace(/[^a-zA-Z0-9-_]/g, "")?.toLowerCase();

  // file extension
  const ext = getImageExtension(file);
  //
  fileSlugName += `_${Date.now()}.${ext}`;
  // image path
  console.log(
    "🚀 ~ file: User.controller.js:150 ~ saveProfilePic ~ fileSlugName:",
    fileSlugName
  );
  const imagePath = path.join(
    __dirname,
    "../uploads/images/users",
    fileSlugName
  );

  const imageBuffer = Buffer.from(file, "base64");

  // var bitmap = new Buffer(file, "base64");
  // write buffer to file
  fs.writeFile(imagePath, imageBuffer, (err) => {
    if (err) {
      console.error("Error saving image:", err);
    } else {
      console.log("Image saved successfully:", imagePath);
    }
  });

  return fileSlugName;
};
