const mongoose = require("mongoose");

const connectDB = (URI) => {
  mongoose.connect(URI).then(() => {
    console.log("MongoDB Connected Successfully!");
  });
};

module.exports = {connectDB};
