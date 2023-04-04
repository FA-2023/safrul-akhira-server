const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const database = require("./config/database");
const cors = require("cors");
require("dotenv").config();

app.use(bodyParser.json());

const userRoutes = require("./routes/User.routes");
const serviceRoutes = require("./routes/Service.routes");

// connect mongodb
database.connectToDb();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server started listening on port ${PORT}`);
});
