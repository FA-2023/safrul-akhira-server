const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const database = require("./config/database");
const cors = require("cors");
require("dotenv").config();

app.use(bodyParser.json({ limit: "50mb" }));

const userRoutes = require("./routes/User.routes");
const categoryRoutes = require("./routes/Category.routes");
const productRoutes = require("./routes/Product.routes");
// orders
const orderRoutes = require("./routes/Order.routes");

// connect mongodb
database.connectToDb();

// express session store
app.use(
  require("express-session")({
    secret: process.env.SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 60, // 60 days
      // httpOnly: false,
    },
    resave: false,
    saveUninitialized: false,
    // store: database.store,
    store: database.store,
  })
);

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use("/uploads", express.static(__dirname + "/uploads"));

app.use("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "not found",
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server started listening on port ${PORT}`);
});
