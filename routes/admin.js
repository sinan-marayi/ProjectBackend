const express = require("express");
const router = express.Router();
const { generateUrl } = require("../config/s3");
const jwt = require("jsonwebtoken");
const { Route53RecoveryReadiness } = require("aws-sdk");
// MODELS
const Carousel = require("../models/carousel");
const Product = require("../models/product");
const Order = require("../models/order");
// JOI VALIDATION
const productJoi = require("../joiValidation/productObject");
const carouselJoi = require("../joiValidation/carouselObject");
//AUTHENTICATION MIDDILEWARE
const verifyToken = require("../helpers/verifyToken");

//  S3 URL
router.get("/s3url", verifyToken, async (req, res) => {
  const url = await generateUrl();
  res.json({ success: true, url: url });
  console.log(url);
});

//ADD CAROUSEL
router.post("/addCarousel", verifyToken, async (req, res) => {
  let newCarousel = {
    heading: req.body.heading,
    offer: req.body.offer,
    category: req.body.category,
    image: req.body.image,
  };
  let isValid = carouselJoi(newCarousel);
  if (isValid.success) {
    let carousel = new Carousel(newCarousel);
    carousel.save((err, data) => {
      if (err) {
        res.json({ success: false, msg: "Adding Carousel is Failed" });
      } else {
        res.json({ success: true, msg: "Adding Carousel is Successfull" });
      }
    });
  } else {
    res.json({ success: false, msg: isValid.msg });
  }
});

// REMOVE CAROUSEL
router.post("/removeCarousel", (req, res) => {
  let id = req.body._id;
  console.log(id);
  Carousel.findByIdAndDelete(id, (err, data) => {
    if (err) {
      throw err;
    } else {
      console.log(data);
      res.json({ success: true, data: data });
    }
  });
});

//ADD PRODUCT
router.post("/addProduct", verifyToken, async (req, res) => {
  let newProduct = {
    name: req.body.name,
    category: req.body.category,
    actualPrice: req.body.actualPrice,
    offerPrice: req.body.offerPrice,
    description: req.body.description,
    thumbnail: req.body.thumbnail,
  };

  let isValid = productJoi(newProduct);
  if (isValid.success) {
    let product = new Product(newProduct);
    product.save((err, data) => {
      if (err) {
        res.json({ success: false, msg: "Adding Product is Failed" });
      } else {
        res.json({ success: true, msg: "Adding Product is Successfull" });
      }
    });
  } else {
    res.json({ success: false, msg: isValid.msg });
  }
});

// ALL ORDERS
router.get("/allOrders", verifyToken, (req, res) => {
  Order.find((err, data) => {
    if (err) {
      throw err;
    } else {
      res.json({ success: true, data: data });
    }
  });
});

// CHANGE STATUS
router.post("/changeStatus", verifyToken, async (req, res) => {
  let id = req.body.id;
  let status = req.body.status;
  if (status === "placed") {
    let order = await Order.findOne({ _id: id });
    if (order) {
      let updated = await order.updateOne({ status: "shipped" });
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    let order = await Order.findOne({ _id: id });
    if (order) {
      let updated = await order.updateOne({ status: "deliverd" });
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  }
});

// ALL PRODUCTS
router.get("/allProducts", verifyToken, async (req, res) => {
  try {
    let products = await Product.find();
    res.json({ success: true, data: products });
  } catch (error) {
    res.json({ success: false });
  }
});

// REMOVE ONE PRODUCT
router.post("/removeProduct", verifyToken, async (req, res) => {
  let id = req.body.id;
  try {
    let deletePro = await Product.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
  }
});

module.exports = router;
