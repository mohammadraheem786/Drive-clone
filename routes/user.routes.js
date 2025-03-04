const express = require("express");
const router = express.Router();
const {body, validationResult} = require("express-validator");
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenc = require('dotenv');

dotenc.config();


router.get("/register", 
 
(req, res) => {
 
    res.render("register");
  });
  
  router.get("/login", (req, res) => {
    res.render("login");
  });

  router.get("/home",(req,res)=>{
    const token = req.cookies.token;
    if(!token){
      res.status(401).send("Unauthorized");
    }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
      if(err){
        return res.status(403).send("Forbidden");
      }
    });
    res.render("home");
  })


//Login Route
router.post("/login", async (req, res) => {
  try {
      const { username, password } = req.body;

      // Find the user in the database
      const userCheck = await User.findOne({ username });
      if (!userCheck) {
          return res.status(400).redirect("/user/login");
      }

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, userCheck.password);
     if(!isMatch){
      return res.status(400).redirect("/user/login");
     }
     //jsonwebtoken 

     const token = jwt.sign({
      email:userCheck.email,
      username:userCheck.username
     },process.env.JWT_SECRET);

     res.cookie("token", token, {
      httpOnly: true,   // Prevents access via JavaScript
      secure: true,     // Ensures cookie is sent only over HTTPS
      sameSite: "Strict", // Protects against CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
     });
     res.redirect("/home");


  } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Internal Server Error");
  }
});

  router.post("/register",
    body('email').trim().isEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().isLength({ min: 3 }),
    async (req, res) => {
        try {
            const { username, email, password } = req.body;
            console.log({ username, email, password });
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Invalid Data"
                });
            }
            
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Hashing the password using bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = new User({ username, email, password: hashedPassword });
            await user.save();
            res.redirect("/user/login");
        } catch (err) {
            console.error(err);
            res.status(500).send("Error creating user");
        }
    }
);

module.exports = router;

