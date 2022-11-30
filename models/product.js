const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name:{
        type:String,
        reqiured:true
    },
    category:{
        type:String,
        required:true,
        lowercase:true
    },
    actualPrice:{
        type:Number,
        required:true
    },
    offerPrice:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },

})

const Product= module.exports = mongoose.model('products',productSchema);
