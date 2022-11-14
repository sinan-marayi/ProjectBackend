const mongoose = require('mongoose')

const orderSchema=mongoose.Schema({
    deliveryDetails:{
        address:{
            type:String,
            required:true
        },
        pincode:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true
        }
    },
    userId:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    total:{
        type:Number,
        reqired:true
    },
    orderedAt:{
        type:Date,
        required:true
    }
})

const Order = module.exports = mongoose.model('orders',orderSchema)