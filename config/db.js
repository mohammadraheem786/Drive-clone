const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/drive");
    console.log("Connection to database has been established");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};

module.exports = connection;
