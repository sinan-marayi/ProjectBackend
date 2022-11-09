const express = require("express");
const router = express.Router();
const { generateUrl } = require("../config/s3");
const jwt=require('jsonwebtoken')
const Carousel=require('../models/carousel')

//AUTHENTICATION MIDDILEWARE
function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    console.log('d');
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

//  S3 URL
router.get("/s3url", verifyToken, async (req, res) => {
  const url = await generateUrl();
  res.json({ success: true, url: url });
  console.log(url);
});

//ADD CAROUSEL
router.post('/addCarousel',verifyToken,async(req,res)=>{
    let newCarousel = {
        heading: req.body.heading,
        offer: req.body.offer,
        category: req.body.category,
        image: req.body.image,
      };
    let carousel =new Carousel(newCarousel)
    carousel.save((err,data)=>{
        if (err) {
            res.json({success:false,msg:'Adding Carousel is Failed'})
        } else {
            res.json({success:true,msg:'Adding Carousel is Successfull'})
            
        }
    })
})

module.exports = router;
