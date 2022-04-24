
const mongoose = require('mongoose')
const ProductSchema  = new mongoose.Schema({
    name:{type:String, required:true}, //name of item
    price:{type:Number,required:true}, //price of item 
    owner:{type:String, required:true} //owner of item
})



const Product = mongoose.model('Product',ProductSchema,'product')
module.exports = Product