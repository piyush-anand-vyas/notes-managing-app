const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://piyush:12345@cluster0.st9t2.mongodb.net/iNotebook";

const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected to mongo...");
  });
};

module.exports = connectToMongo;
