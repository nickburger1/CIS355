/*
TO DO 
    
*/

const minimist = require('minimist') //import minimist to read commands from terminal
const fs = require('fs') //import fs to read/write to file
const { Table } = require('console-table-printer') //import table generator

let args = minimist(process.argv.slice(2),{}) //variable to store the specified command


function readUsers() { //read contents of file
    let inputFile = fs.readFileSync('users.json').toString()
    let users =JSON.parse(inputFile)
    return users
}
function readTransactions() { //read contents of file
    let inputFile = fs.readFileSync('transactions.json').toString()
    let transactions =JSON.parse(inputFile)
    return transactions
}
function writeTransactions(transactions) { //add new content to file
    let JSONstr =JSON.stringify(transactions)
    fs.writeFileSync('transactions.json',JSONstr)
}
function writeUsers(users) { //add new content to file
    let JSONstr =JSON.stringify(users)
    fs.writeFileSync('users.json',JSONstr)
}

function itemID() { //create a random ID for items 1-100
    let ID = Math.floor(Math.random() * 101)
    return ID
}

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

//add user function
function addUser(args) {
    let users = readUsers() //read file
    let user = {} //create empty object to store user
    let exist = false //variable to store if a username already exists

    if(users.length === 0){ //if first entry 
        user.username = args.username //set username
        user.name = args.name //set name
        if('balance' in args){ //if balance is provided
            user.balance = args.balance //set balance
        }else { //if balance is not provided
            user.balance = 100 //set balance to defualt 100
        }
        user.items = [] //create empty array to store items

        users.push(user) //add all properties to user object
        writeUsers(users) //add user to user file
    }else if(users.length > 0){ //if an entry already exists
        for(let currentUser of users) { //iterate through all existing users
            if(currentUser.username === args.username){ //if a user already has the username provided 
                exist = true //set the existence to true
                console.log("ERROR: Username Already Exists") //print error
            }
        }
        if(exist === false){ //if no user has username
            //set all properties, add to user object, update file
            user.username = args.username 
            user.name = args.name 
            if('balance' in args){
                user.balance = args.balance
            }else {
                user.balance = 100
            }
            user.items = []

            users.push(user)
            writeUsers(users)
        }
    }  
}

//add item function
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

//delete user function
function deleteUser(args){
    let users = readUsers() //read contents of file 
    for(let i = 0; i < users.length; i++) { //iterate through user file
        if(users[i].username === args.username){ //if matching username is found
            users.splice(i,1) //remove that object
        }
    }
    writeUsers(users) //update file
}

//function to buy an item
function buyItem(args) {
    let users = readUsers() //read contents of file
    let transactions = readTransactions()
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

                                //extra credit
                                let transaction = {} //create empty transaction object
                                transaction.id = item.id //set id value to item id that is being sold
                                transaction.buyer = buyer.username //set buyer to the buyer of the item
                                transaction.seller = seller.username //set seller to the seller of the item
                                transaction.price = item.price //set the price to the price of the item
                                transaction.date = new Date().today() + " @ " + new Date().timeNow() //create a time stamp for the transaction
                                transactions.push(transaction) //push this transaction to the transaction array
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
    writeTransactions(transactions) //update transaction array
}

//create the user table 
function createUserTable() {
    const userTable = new Table({ //create table
        columns: [ //create columns for table
            {name: 'user_name', alignment: 'center'}, //username column
            {name: 'name', alignment: 'center'}, //name column
            {name: 'balance', alignment: 'center'}, //balance column
            {name: 'items_for_sale', title: 'Items for Sale', alignment: 'center'} //items for sale column
    ]
})
    let users = readUsers() //read contents of file
    for(let user of users) { //iterate through file
        userTable.addRow({user_name: user.username, name: user.name, balance: "$"+user.balance, items_for_sale: user.items.length}) //add a row for each user 
    }
    console.log(" ")
    console.log("--Users Log--")
    userTable.printTable() //print the table
}

//create the products table
function createProductsTable() {
    const productTable = new Table({ //create new table
        columns: [ //create columns
            {name: 'id', alignment: 'center'}, //create ID column
            {name: 'name', alignment: 'center'}, //create name column
            {name: 'seller', alignment: 'center'}, //create seller column
            {name: 'price', alignment: 'center'} //create price column
    ]
})
    let users = readUsers() //read contents of file
    for(let user of users) { //iterate through users
        for(let item of user.items){ //iterate through each users item array
            productTable.addRow({id: item.id, name: item.name, seller: user.username, price: "$"+item.price}) //add rows for each of the users products
        }
    }
    console.log(" ")
    console.log("--Product Log--")
    productTable.printTable() //print table
}
//create transaction table
function createTransactionTable() {
    const transactionTable = new Table({ //create table
        columns: [ //create columns for table
            {name: 'item_id', title: 'Item ID', alignment: 'center'}, //create item ID column
            {name: 'seller', alignment: 'center'}, //create seller column
            {name: 'buyer', alignment: 'center'}, //create buyer column
            {name: 'price', alignment: 'center'}, //create price column
            {name: 'date', alignment: 'center'} //create date column
    ]
})
    let transactions = readTransactions()
    for(let transaction of transactions) { //iterate through file
        transactionTable.addRow({item_id: transaction.id, seller: transaction.seller, buyer: transaction.buyer, price: "$" + transaction.price, date: transaction.date}) //populate rows of the table 
    }
    console.log(" ")
    console.log("--Transaction Log--")
    transactionTable.printTable() //print the table
}

//view user table
function viewUser(){
    createUserTable()
}
//view products table
function viewProducts() {
    createProductsTable()
}
//view transaction table
function viewTransactions() {
    createTransactionTable()
}

//call functions based on command
if('addUser' in args){
    addUser(args)
}else if('deleteUser' in args) {
    deleteUser(args)
}else if('addItem' in args) {
    addItem(args)
}else if('buy' in args){
    buyItem(args)
}else if(args.view === 'users'){
    viewUser()
}else if(args.view === 'products'){
    viewProducts()
}else if(args.view === 'all'){
    viewUser()
    viewProducts()
    viewTransactions()
}else {
    console.log("Invalid Command")
}
