const User = require("../models/User.model");

exports.signup = async (req, res) => {
  const { username, email, password, confirmPassword, phone } = req.body;

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
    });

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
    const userExists = await User.findOne({ email });
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
