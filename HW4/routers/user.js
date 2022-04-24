const express = require("express")

const User = require("../models/user")
const Product = require("../models/products")

const router = new express.Router()



router.post('/users',(req,res)=>{ //create new user
    const u = new User(req.body) //fill in user info from given object
    u.save((error,response)=>{ //save new user into the database
        if(error)
                res.send({error:error})
                else{
                    console.log(response)
                   
                    res.send(response) //send the new user
                }
    })
})

router.get('/users',(req,res)=>{ //veiw all users
    User.find({},(error,users)=>{ //find all users in database
        if(error)
            console.log(error)
        else   
            console.log(users)
            res.send(users) //send users
        })
    
})

router.get('/users/:user_name',(req,res)=>{ //view single users info
    User.find({user_name:req.params.user_name},(error,user)=>{ //find the user witht that username
        if(error)
            res.send({error:error})
        else{
            User.findById(user[0]._id).populate('items').exec((error,user)=>{ //populate the items array to show the items that they own
                if(error)
                    res.send({error:error})
                else{
                    res.send(user) //send user 
                }
            })
        }
    })
    
})


router.delete('/users/:user_name',(req,res)=>{ //delete user
    
    User.findOneAndDelete({user_name:req.params.user_name},(error,user)=>{ //find the user and delete them from database
        if(error)
            res.send({error:error})
        else{
            if(!user) //if user is not found 
                res.send({msg:"could not locate user "+req.params.id})//send error message
            else{
                Product.findOneAndDelete({owner:user._id},(error,product)=>{ //find items owned by delted user and delete them
                    if(error)
                        res.send({error:error})
                    else{
                        res.send(product) //send products that were deleted
                    }
                })
                res.send(user) //send user that was deleted

            }
        }
    })
})
let u = [] //create array to store all users 
router.get('/summary',(req,res)=>{ //veiw all users and items
   
    User.find({},(error,users)=>{ //find all users
        if(error)
            res.send({error:error})
        else{
            for(let i = 0; i<users.length; i++){ //loop through all users
                User.findById(users[i]._id).populate('items').exec((error,user)=>{ //add their items to the items array
                    if(error)
                        res.send({error:error})
                    else{
                        let u1 = user //create new object for current user
                        u.push(u1) //push into array
                        if(u.length===users.length) //if all users have been populated
                            res.send(u)   //send array     
                    }
                })
            }
        }
    })
})


module.exports=router