const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {
  generaterazorpay,
  signatureVerification,
} = require("../config/razorpay");

const User = require("../models/user");
const Carousel = require("../models/carousel");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const cart = require("../models/cart");
const user = require("../models/user");

const userJoi = require("../joiValidation/userObject");

//AUTHENTICATION MIDDILEWARE
const verifyToken = require('../helpers/verifyToken')

//USER REGISTRATION
router.post("/register", async (req, res) => {
  const data = req.body;
  let newUser = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
  };

  let isValid = userJoi(newUser);
  console.log(isValid);

  if (isValid.success) {
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
  } else {
    res.json({ success: false, msg: isValid.msg });
  }
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
      let cart = await Cart.findOne({ userId: userId });
      let updated = await cart.update({
        $push: {
          products: {
            productId: mongoose.Types.ObjectId(productId),
            quantity: 1,
          },
        },
      });
    }
  } else {
    //if there is no cart in the name of user
    let cart = new Cart({
      userId: userId,
      products: [{ productId: productId, quantity: 1 }],
    });
    cart.save((err, data) => {
      if (err) {
        throw err;
      } else {
        res.json({ sucess: true, msg: "new cart created" });
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
    res.json({ success: true, data: data });
  }
});

//QUANTITY INCREMENT OR DECREMENT IN CART
router.post("/incOrdec", verifyToken, async (req, res) => {
  let user = req.body.user;
  let value = req.body.value;
  let productId = req.body.product;
  console.log(user, value, productId);

  if (value === "inc") {
    console.log("inc");
    Cart.findOneAndUpdate(
      {
        userId: user,
        "products.productId": mongoose.Types.ObjectId(productId),
      },
      {
        $inc: { "products.$.quantity": 1 },
      },
      (err, data) => {
        res.json({ sucess: true });
      }
    );
  } else {
    console.log("dec");

    Cart.findOneAndUpdate(
      {
        userId: user,
        "products.productId": mongoose.Types.ObjectId(productId),
      },
      {
        $inc: { "products.$.quantity": -1 },
      },
      (err, data) => {
        res.json({ sucess: true });
      }
    );
  }
});

//REMOVE ITEM FROM CART
router.post("/removeFromCart", verifyToken, async (req, res) => {
  let user = req.body.userId;
  let productId = req.body.productId;

  let cart = await Cart.findOne({ userId: user });
  let updated = await cart.update({
    $pull: {
      products: {
        productId: mongoose.Types.ObjectId(productId),
      },
    },
  });
  if (updated) {
    res.json({ success: true });
  }
});

//TO GET THE TOTAL
router.post("/totalAmount", verifyToken, async (req, res) => {
  let user = req.body.userId;
  let total = await Cart.aggregate([
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
    {
      $project: {
        productId: 1,
        quantity: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: {
          $sum: { $multiply: ["$quantity", "$product.offerPrice"] },
        },
      },
    },
  ]);
  if (total) {
    res.json({ success: true, total: total });
  } else {
    res.json({ success: false, msg: "unable to find the total" });
  }
});

//CHECKOUT
router.post("/checkout", verifyToken, async (req, res) => {
  let user = req.body.userId;
  let total = req.body.totalAmount;
  let address = req.body.address;
  let pincode = req.body.pincode;
  let phone = req.body.phone;
  let products = await Cart.aggregate([
    { $match: { userId: user } },
    { $project: { products: 1 } },
  ]);
  let paymentMethod = req.body.paymentMethod;
  let status = paymentMethod === "online" ? "pending" : "placed";

  let newOrder = {
    deliveryDetails: {
      address: address,
      pincode: pincode,
      phone: phone,
    },
    products: products,
    userId: user,
    paymentMethod: paymentMethod,
    status: status,
    total: total,
    orderedAt: new Date(),
  };
  let order = new Order(newOrder);
  order.save((err, data) => {
    if (err) {
      res.json({ success: false, msg: "failed to place a order" });
    } else {
      if (paymentMethod === "cod") {
        res.json({ CODsuccess: true, msg: "placed your cod order" });
      } else {
        generaterazorpay(data._id, total).then((result) => {
          res.json({ success: true, order: result });
        });
      }
    }
  });
});

//PAYMENT VERIFICATION
router.post("/verifyPayment", verifyToken, (req, res) => {
  let orderId = req.body.razorpay_order_id;
  let paymentId = req.body.razorpay_payment_id;
  let signature = req.body.razorpay_signature;
  let id = req.body.receipt;
  let userId = req.body.userId;

  signatureVerification(
    //payment_verification
    orderId,
    paymentId,
    signature
  )
    .then((response) => {
      //ifSuccessFull
      //orderPlaced
      Order.updateOne(
        { _id: id },
        { $set: { status: "placed" } },
        (err, data) => {
          if (err) {
            throw err;
          } else {
            //removeCart
            Cart.findOneAndRemove({ userId: userId }, (err, data) => {
              if (err) {
                throw err;
              } else {
                res.json({ success: true, msg: "payment success" });
              }
            });
          }
        }
      );
    })
    .catch((err) => {
      //ifFailed
      console.log("failed" + err);
      res.json({ success: false, msg: "payment failed" });
    });
});

//SEND ORDERS TO USERS
router.post("/sendOrder", verifyToken, async (req, res) => {
  let orders = await Order.find({ userId: req.body.userId });
  if (orders) {
    res.json({ success: true, orders: orders });
  } else {
    res.json({ success: false });
  }
});

// PRODUCT LISTS
router.post("/productList", async (req, res) => {
  let category = req.body.category.toLowerCase();
  console.log(category);
  Product.find({ category: category }, (err, data) => {
    if (err) {
      throw err;
    } else {
      res.json({ success: true, data: data });
    }
  });
});

router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
