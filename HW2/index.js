
//imports and setting up server
const express = require("express")
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000
app.listen(port)


//function to read users file
function readUsers(){
    let user = fs.readFileSync('users.json').toString()
    let users = JSON.parse(user)
    return users
}


function writeUsers(users) { //add new content to file
    let JSONstr =JSON.stringify(users)
    fs.writeFileSync('users.json',JSONstr)
}

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.get('/',(req,res)=>{//load/show homepage
    res.render('homepage.ejs',{title:"Infinity Marketplace"})
     
})

app.use(express.urlencoded({extended: true}))
app.post('/register',(req,res)=>{ //to register a user
    let users = readUsers() //read exsisting users
    if(req.body.balance === ''){ //if balance is not given
        req.body.balance = '100' //set to 100
    }
    if(users.length > 0){ //if this is not the first user in the file
    for(let user of users){
        if(user.username === req.body.username){ //if username already mathes on in the file
            res.redirect('/') //send back to homepage
        }else{ //if not
            addUser(req.body) //add the user
            res.redirect(`/user/${req.body.username}`) //send to user page
        }
    }
    }else { //if this is the first user
        addUser(req.body) //add user
        res.redirect(`/user/${req.body.username}`) //send to user page
}
        
})

app.use(express.urlencoded({extended: true}))
app.post('/login',(req,res)=>{ //log into existing user
     
    let users = readUsers() //read users
    for(let user of users){
        if(user.username === req.body.username){ //check if match
            
            res.redirect(`/user/${req.body.username}`) //redirect to user page
        }
    } 
})


app.get('/user/:username',(req,res)=>{

    let users = readUsers() //read user file
    let currentUser = null
    
    for(let user of users){
        if(user.username === req.params.username){ //if the username matches the a user in the file
            currentUser = user //set curent user to that user
        }
    }
    console.log(users)
    res.render('user.ejs',{title: "User Page", user:currentUser, users:users}) //send user and user objects and render page
})

app.post('/logout',(req,res)=>{
    res.redirect('/') //logout and send to homepage
})

app.post('/buy',(req,res)=>{
    buyItem(req.body)
    res.redirect('/user/:username') //buy item
})


//add user function
function addUser(args) {
    let users = readUsers() //read file
    let user = {} //create empty object to store user
    let exist = false //variable to store if a username already exists
    let works = false
    console.log(args)
    if(works === false) {
    
    if(users.length === 0){ //if first entry 
        user.username = args.username //set username
        user.name = args.name //set name
        user.balance = args.balance
        user.items = [] //create empty array to store items
        console.log("test " + user)
        users.push(user) //add all properties to user object
        writeUsers(users) //add user to user file
    }else if(users.length > 0){ //if an entry already exists
        for(let currentUser of users) { //iterate through all existing users
            if(currentUser.username === args.username){ //if a user already has the username provided 
                exist = true //set the existence to true
                 
            }
        }
        if(exist === false){ //if no user has username
            //set all properties, add to user object, update file
            user.username = args.username 
            user.name = args.name 
            if(args.balance = ""){
                user.balance = 100
            }else {
                user.balance = args.balance
            }
            user.items = []

            users.push(user)
            writeUsers(users)
            }
        } 
        return true 
        
    }else {
        return false
    }
    
}

function itemID() { //create a random ID for items 1-100
    let ID = Math.floor(Math.random() * 101)
    return ID
}

function addItem(args) {
    let users = readUsers() //read file contents
    item = {} //create empty object to store items
    for(let user of users) { //iterate through users
        if(user.username === args.owner){ //if username exists
           item.id = itemID() //create an item ID
           item.name = args.name //set item name
           item.price = args.price //set item price
           user.items.push(item) //push item object into array
        }
    }
    writeUsers(users) //update file
}


//function to buy an item
function buyItem(args) {
let users = readUsers() //read contents of file
let successful = false //variable to see if transaction is successful
for(buyer of users){ //iterate through users
    if(buyer.username === args.buyer){ //check to see if the buyer exists
        for(let seller of users){ //iterate through the users again for the items
            for(let item of seller.items){ //iterate though each users items
                if(item.id === args.itemid){ //if the items id exists
                    if(seller.username !== args.buyer){ //if the buyer is not also the seller
                        if(buyer.balance >= item.price){ //if the buyer has enough money to purchace the item 
                            buyer.balance = buyer.balance - item.price //subratct the item price from the buyers balance
                            seller.balance = seller.balance + item.price //add the item price to the sellers balance
                            buyer.items.push(item) //push new item into buyers item array
                            seller.items.splice(item,1) //remove item from sellers item array
                            writeUsers(users) //update file
                            successful = true
                            console.log("Purchase Successful!")
                        }
                    }
                }
            }
        }
    }
}
if(successful === false) { //if purchace was not successful
    console.log("ERROR: Purchace Was Not Successful")
    }
}







