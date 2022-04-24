const express = require("express")
const bcrypt = require('bcrypt')
const User = require("../models/user")
const Product = require("../models/products")
const router = new express.Router()


const authenticateUser = async (req,res,next)=>{ //authenitcate user function samne as from products
    if(!req.session.user_id){
        res.send({message: 'You must log in first'})
    }
    else{
        try{
        const user = await User.findById(req.session.user_id)
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



router.post('/users/register', async (req,res)=>{ //register a new user
    const user_name = req.body.user_name //assign given username to a variable
    let password = req.body.password //assignb given password to a variable
    const name = req.body.name //assign given name to a variable

    const checkUsername = await User.findOne({user_name: user_name}) //check if the username already exists

    if(checkUsername !== null){ //if a user already has that username
        res.send({message: `${user_name} has already been taken`}) //send error mesasge
    }else{ //if the username is unused
        if(req.body.balance !== undefined){ //if balance was given
            balance = req.body.balance //asign given balance to variable
            try{
                password = await bcrypt.hash(password,8) //ecyrpt the password
                const user = new User({name:name, user_name:user_name, password:password}) //create new user object
                const u = await user.save() //save user to database
                res.send(u)
                }catch(error){
                    console.log(error)
                }
        }else{ //if balance was not given, use defualt 100
            try{
                password = await bcrypt.hash(password,8) //encrypt password
                const user = new User({name:name, user_name:user_name, password:password}) //create new user object
                const u = await user.save()//save user
                res.send(u) //send user object
                }catch(error){
                    console.log(error)
                }
        }
        
    }
})

router.post('/users/login', async (req,res)=>{ //log in as existing user
    const user_name = req.body.user_name //assign given username and password to variable
    const password = req.body.password

    const checkUser = await User.findOne({user_name:user_name}) //check if a username with that username exists

    if(checkUser !== null){
        const checkPass = await bcrypt.compare(password,checkUser.password) //if the username exists, check to see if the hash of the given password mathces the one stored for the user

        if(checkPass){ //if all checks pass
            console.log(req.session)
            req.session.user_id = checkUser.id //assign the user_id of the session to the id of the signed in user
            res.send({message: `You are now logged in as ${checkUser.name}`}) //send confirmation message
        }else{ //if passwords do not match then send error message
            res.send({message: 'Incorrect Password'})
        }
    }else{ //if no user stored in database has that username then send error message
        res.send({message:`Username ${checkUser.user_name} does not exist`})
    }
})

router.get('/users/me', authenticateUser, async (req,res)=>{ //get profile info from the logged in user
    let userID = req.session.user_id //set the user_id from the session to a variable

    const user = await User.findById(userID) //find the info of the logged in user
    const items = await Product.find({owner:user.id}) //find the items the logged in user owns

    res.send({name:user.name, user_name:user.user_name, balance:user.balance, items:items}) //send the info
})

router.post('/users/logout', authenticateUser, async (req,res)=>{ //logout the logged in user
    const user = await User.findById(req.session.user_id) //find the info of the logged in user
    res.send({message: `${user.name} has been logged out`}) //send confimation message
    req.session.destroy() //destroy session after finding info so you still have access to req.session.user_id
})

router.delete('/users/me', authenticateUser, async (req,res)=>{ //delete logged in user
    try {
        const user = await User.deleteOne({id: req.session.user_id}) //delete the user based on the session user_id
        await Product.deleteMany({owner:user.id}) //delete the products that the user owns

        req.session.destroy() //destroy session since after deletion they should no longer have access to app's functionality
        res.send({message:`${req.body.name} has been deleted`}) //send confirmation message
    }catch (error) {
        console.log(error)
    }
})

let u = [] //create array to store all users 
router.get('/summary', async (req,res)=>{ //veiw all users and items
   
    const users = await User.find({}) //find all users
        for(let i = 0; i<users.length; i++){ //loop through user array
            const user = await User.findById(users[i]._id).populate('items').exec() //get each user and populate the virutal items feild
            let u1 = user //assign individual user object with items to a new object
            u.push(u1) //push that object into the array
            if(u.length === users.length) //once all users with items have been added to the array
                res.send(u)   //send summary    
    }     
})


module.exports=router