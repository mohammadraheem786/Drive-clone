const multer = require("multer");

const storage = multer.storage;   
const upload = multer({ 
    storage : storage,
    unique: true,
    
 });

module.exports = upload;
