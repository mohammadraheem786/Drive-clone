const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    email: { type: String, required: true },  // Store email as a String
    username: { type: String, required: true },
    file_url: { type: String }
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
