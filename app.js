const express = require("express");
const app = express();
const dotenv = require("dotenv");
const morgan = require("morgan");
const Userrouter = require("./routes/user.routes");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index.routes");
const dbConnect = require("./config/db");
const cloudinary = require("./config/cloudinary");
const upload = require("./config/multer");

dbConnect();
dotenv.config();
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan('dev'));  // Logs requests in 'dev' format


app.use("/",indexRouter);
app.get("/",(req,res)=>{
    res.render("index");
});

app.use("/user",Userrouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});