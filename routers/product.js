
const express = require("express")
const Product = require("../models/products")
const User = require("../models/user")

const router = new express.Router()

router.post('/products',(req,res)=>{ //create new item
    User.findOne({user_name:req.body.seller},(error,user)=>{ //find the user with the given username
        if(error)
            console.log(error)
        else{
            const p = new Product({ //create new item
                name:req.body.name, //name of item 
                price:req.body.price, //price of item
                owner:user.id  //id of the owner used instead of the username
            })

            p.save((error,response)=>{ //save the item to the database
                if(error)
                        res.send({error:error})
                        else{
                            console.log(response)
                           
                            res.send(response)
                        }
            })
        }
    })
    
   
})

router.get('/products',(req,res)=>{ //view all products
    Product.find({},(error,products)=>{ //find all products in the database
        if(error)
            res.send({error:error})
        else{
            res.send(products) //send all products
        }
    })
})

router.delete('/products/:id',(req,res)=>{ //delete a product
    Product.findByIdAndDelete(req.params.id,(error,response)=>{ //find and delete the product with the given id
        if(error)
            res.send({error:error})
        else{
            if(response)
                res.send({msg:"Product "+req.params.id+" was succesfully deleted."}) //if the product was successfully deleted
            else
                res.send({msg:"Product "+req.params.id+" could not be located."}) //if that product doesnt exsist
        }
    })
})

router.post('/products/buy',(req,res)=>{ //buy item 
    User.findOne({user_name:req.body.user_name},(error,buyer)=>{//find the user that wants to buy the item
        if(error)
            console.log({msg:`Opps, ${req.body.user_name} does not exsits`}) //if the user doesnt exsist
        else{
            Product.findById(req.body.productID, (error,product)=>{ //find the product that is being bought
                if(error)
                    console.log({error:error})
                else{
                    if(product.owner==buyer.id){ //if the buyer already owns product
                        res.send({msg:`Opps, ${buyer.name} already owns this item`})   //send error message     
                    }else if(product.price > buyer.balance){//if buyer does not have enough money to buy item
                        res.send({msg:`Opps, ${buyer.name} has insufficient funds`}) //send error message
                    }else{ //if checks are passed
                        User.findById(product.owner,(error,seller)=>{ //find the current owner of the item
                            if(error)
                                console.log({error:error})
                            else{
                                User.updateOne({user_name: buyer.user_name}, {$set: {balance: buyer.balance - product.price}},(error,response)=>{ //update the buyers balance
                                    if(error)
                                        console.log({error:error})
                                    else{
                                        User.updateOne({user_name: seller.user_name}, {$set: {balance: seller.balance + product.price}}, (error,response)=>{ //update the sellers balance
                                            if(error)
                                                console.log({error:error})
                                            else{
                                                Product.updateOne({_id: req.body.productID}, {$set: {owner: buyer.id}}, (error,response)=>{ //update the products owner
                                                    if(error)
                                                        console.log(error)
                                                    else{
                                                        res.send({msg:"Transaction Complete"}) //send comfirmation message
                                                    
                                                    }
                                                })  
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            })
       }   
    })
})


module.exports = router