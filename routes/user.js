const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/user");
const Carousel = require("../models/carousel");
const Product = require("../models/product");
const Cart = require("../models/cart");
const user = require("../models/user");

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
        user: { email: adminCred.email, id: "123" },
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
router.get("/sendCarousel", (req, res) => {
  Carousel.find((err, data) => {
    if (err) {
      throw err;
    } else {
      res.json({ data: data });
    }
  });
});

//SEND PRODUCT
router.get("/sendProduct", (req, res) => {
  Product.find((err, data) => {
    if (err) {
      throw err;
    } else {
      res.json({ data: data });
    }
  });
});

//SEND ONE PRODUCT
router.post("/sendOneProduct", (req, res) => {
  let id = req.body.id;
  Product.findById(id, (err, data) => {
    if (err) {
      res.json({ success: false });
    } else {
      res.json({ success: true, data: data });
    }
  });
});

//ADD TO CART
router.post("/addToCart", verifyToken, async (req, res) => {
  let userId = req.body.userId;
  let productId = req.body.productId;

  let userCart = await Cart.findOne({ userId: userId });
  //if there is a cart for user already
  if (userCart) {
    let proExist = userCart.products.findIndex(
      (product) => product.productId.toString() === productId
      // mongoose.Types.ObjectId(productId)
    );
    console.log(proExist);
    //if the product is exist in the cart
    if (proExist != -1) {
      Cart.findOneAndUpdate(
        {
          userId: userId,
          "products.productId": mongoose.Types.ObjectId(productId),
        },
        { $inc: { "products.$.quantity": 1 } },
        (err, data) => {}
      );
    } else {
      //if the product is not exist in the cart
      Cart.findOneAndUpdate(
        { userId: userId },
        {
          $push: {
            products: {
              productId: mongoose.Types.ObjectId(productId),
              quantity: 1,
            },
          },
        }
      );
    }
  } else {
    //if there is no cart in the name of user
    let cart = new Cart({
      userId: userId,
      products: [{ productId: productId, quantity: 1 }],
    });
    cart.save((err,data)=>{
      if (err) {
        throw err
      } else {
        res.json({sucess:true,msg:"new cart created"})
      }
    });
  }
});

//SEND CART
router.post("/sendCart", verifyToken, async (req, res) => {
  let user = req.body.userId;
  let cart = await Cart.find({ userId: user });
  if (cart.length === 0) {
    res.json({ success: false, msg: "cart is empty" });
    console.log("false");
  } else {
    let data = await Cart.aggregate([
      {
        $match: { userId: user },
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          productId: "$products.productId",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
    ]);
    res.json({ success: true,data:data });
    
  }
});

router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
