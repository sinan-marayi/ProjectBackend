const express = require('express')
const mongoose = require('mongoose')
const cors=require('cors')
const bodyParser = require('body-parser')
const users = require('./routes/user')
const admin = require('./routes/admin')

const app=express()

//Database connection
const url='mongodb+srv://user:database@cluster0.cnjdoba.mongodb.net/project?retryWrites=true&w=majority'
mongoose.connect(url,()=>{
    console.log('connected to the database');
})

//Middlewares
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

//Routes
app.use('/users',users)
app.use('/admin',admin)


//Server
app.listen(3000,()=>{
    console.log("server is running on port 3000");
})