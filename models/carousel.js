const mongoose = require('mongoose')

const carouselSchema = mongoose.Schema({
    heading:{
        type:String,
        reqiured:true
    },
    offer:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    }
})

const Carousel= module.exports = mongoose.model('carousels',carouselSchema);

