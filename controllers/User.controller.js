const User = require("../models/User.model");

exports.signup = async (req, res) => {
  const {
    username,
    email,
    password,
    confirmPassword,
    phone,
    role,
    profile_pic,
  } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "username, email, password & confirmPassword are required",
      status: 400,
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "password & confirmPassword are not the same",
      status: 400,
    });
  }

  if (role === "vendor" && !phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required for the vendor registration.",
      status: 400,
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "email already linked with a user account",
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

    if (profile_pic) {
      const profilePicUrl = saveProfilePic(profile_pic, username);
      newUser.profile_pic = profilePicUrl;
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

  fileSlugName += `.${Date.now()}`;
  // file extension
  const ext = getImageExtension(file);
  //
  console.log("Image extension:", ext);
  // image path
  const imagePath = path.join(
    __dirname,
    "../uploads/images/users",
    `${fileSlugName}.${ext}`
  );

  const imageBuffer = Buffer.from(file, "base64");
  console.log(
    "🚀 ~ file: User.controller.js:154 ~ saveProfilePic ~ imageBuffer:",
    imageBuffer
  );
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
