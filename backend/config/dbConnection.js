const mongoose = require("mongoose");

const connectDB = (URI) => {
  mongoose.connect(URI).then(() => {
    console.log("MongoDB Connected Successfully!");
  }).catch((error) => {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });
};

module.exports = {connectDB};
