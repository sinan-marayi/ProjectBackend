const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user"); 
const Carousel = require("../models/carousel"); 

//AUTHENTICATION MIDDILEWARE
function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.json({ success: false, msg: "unauthorized request" });
  }
  let token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.json({ success: false, msg: "unauthorized request" });
  }
  jwt.verify(token, "ict", (err, payload) => {
    if (err) {
      res.json({ success: false, msg: "unauthorized request" });
    } else {
      req.user = payload;
      console.log(req.user);
      next();
    }
  });
}

//USER REGISTRATION
router.post("/register", async (req, res) => {
  const data = req.body;
  let newUser = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
  };

  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(newUser.password, salt);
  newUser.password = hash; //encrypting the password

  const user = new User(newUser);
  user.save((err, result) => {
    if (err) {
      res.json({ success: false, msg: "fail to add user" });
    } else {
      res.json({ success: true, msg: "User added successfully" });
    }
  });
});

//AUTHENTICATION OR LOGIN
router.post("/login", async (req, res) => {
  const userCred = {
    email: req.body.email,
    password: req.body.password,
  };
  const adminCred = {
    email: "admin@gmail.com",
    password: "admin123",
  };
  if (userCred.email === adminCred.email) {
    if (userCred.password === adminCred.password) {
      payload = { email: adminCred.email };
      let token = jwt.sign(payload, "ict");
      res.json({
        success: true,
        token: `Bearer ${token}`,
        user: { email: adminCred.email },
        isAdmin: true,
      });
    } else {
      res.json({ success: false, msg: "Incorrect Password" });
    }
  } else {
    let user = await User.findOne({ email: userCred.email }); //find the email in db

    if (!user) {
      res.json({ success: false, msg: "User is not Found" });
    } else {
      let isMatch = await bcrypt.compare(userCred.password, user.password); // checking the password
      if (!isMatch) {
        res.json({ success: false, msg: "Incorrect Password" });
      } else {
        payload = { email: user.email };
        let token = jwt.sign(payload, "ict");
        res.json({
          success: true,
          token: `Bearer ${token}`,
          isAdmin: false,
          user: { name: user.name, email: user.email, id: user._id },
        });
      }
    }
  }
});

//SEND CAROUSEL
router.get('/sendCarousel',(req,res)=>{
  Carousel.find((err,data)=>{
    if (err) {
      throw err
    } else {
      res.json({data:data})
    }
  })
})

router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
