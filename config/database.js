const mongoose = require("mongoose");
require("dotenv").config();

module.exports = {
  connectToDb: () => {
    try {
      mongoose.connect(process.env.DB_HOST_LIVE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      const database = mongoose.connection;
      database.on("error", (error) => {
        console.error.bind("error", "connect error");
        throw new Error(`Fail to connect to database ${error}`);
      });
      database.once("open", () => {
        console.log("Mongodb connected...");
      });
    } catch (error) {
      console.log("Database error", error);
    }
  },
};
