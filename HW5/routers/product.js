
const express = require("express")
const Product = require("../models/products")
const User = require("../models/user")

const router = new express.Router()

const authenticateUser = async (req,res,next)=>{ //authenticate user function
    if(!req.session.user_id){
        res.send({message: 'You must log in first'}) //if there is no user_id in session it means you are not logged in
    }
    else{
        try{
        const user = await User.findById(req.session.user_id) //if there is a user_id in session find which user is logged in
        if(user === null){
            res.send({message: 'You must log in first'})
        }
        else {
            req.user=user 
            next()
        }
    }
    catch(e){
        res.send({message: 'You must log in first'})
        } 
    }
}

router.post('/products', authenticateUser, async (req,res)=>{ //create new product for logged in user
    const p = new Product({name:req.body.name, price:req.body.price, owner:req.session.user_id}) //add info from request to a new product object
    await p.save() //save to database
    res.send(p) //send newly added product
})


router.get('/products', authenticateUser, async (req,res)=>{ //view all products in database
    const products = await Product.find({}) //find all products
    res.send(products)  //send all products
})

router.delete('/products/:id', authenticateUser, async (req,res)=>{ //delete an item from the logged in users inventory
    const item = await Product.findOne({_id:req.params.id}) //find which item the user wishes to delete
    
    if(item.owner === req.session.user_id){ //if the logged in user is the owner
        await Product.deleteOne({_id:req.params.id}) //delete product
        res.send({message: `${item.name} was deleted`}) //send confirmation message
    }else{ //if user is not the owner
        res.send({message:`You do not have premission to delete ${item.name}`}) //send error message
    }
})

router.post('/products/buy', authenticateUser, async (req,res)=>{ //buy an item 
    const item = await Product.findById(req.body.productID) //find item that the logged in user wants to buy
    const buyer = await User.findById(req.session.user_id) //find the buyer 
    const seller = await User.findById(item.owner) //find the current owner of the item 

    if(buyer.id === seller.id){ //if the buyer already owns the item
        res.send({message:'You already own this item'}) //send error message
    }else if(item.price > buyer.balance){ //if buyer does not have enough money to buy the item
        res.send({message:'You have insufficient funds'}) //send the error message
    }else{ //if all checks pass
        await User.updateOne({user_name: buyer.user_name}, {$set: {balance: buyer.balance - item.price}}) //subtract cost of item from buyers balance
        await User.updateOne({user_name: seller.user_name}, {$set: {balance: seller.balance + item.price}}) //add price of item to sellers balance
        await Product.updateOne({_id: req.body.productID}, {$set: {owner: buyer.id}}) //transfer ownership of item to the buyer
        res.send({message: 'Transaction successful'}) //send confirmation message
    }
})


module.exports = router