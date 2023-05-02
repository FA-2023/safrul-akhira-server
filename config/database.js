const mongoose = require("mongoose");
require("dotenv").config();
// express session store
const MongoStore = require("connect-mongo");

exports.connectToDb = () => {
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
};

const store = MongoStore.create({
  mongoUrl: process.env.DB_HOST_LIVE,
  collectionName: "expressSessions",
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
});

// events
store.once("create", function (sessionId) {
  console.log(`Mongo store session created ${sessionId}`);
});
store.on("destroy", function (sessionId) {
  console.log(`Mongo store session destroyed ${sessionId}`);
});

exports.store = store;
