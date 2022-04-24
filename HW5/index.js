require('dotenv').config()
const express = require("express")
const path = require('path')
const mongoose = require('mongoose')
const productRouter = require("./routers/product")
const userRouter = require("./routers/user")

const session = require('express-session')
const MongoStore = require('connect-mongo')

const app = express()
const port = process.env.PORT
app.listen(port)

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(express.json())




//copy the connection string for your mongodb cluster. The sample_training database contains the Zips collection
const url = process.env.MONGO_URL

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true

},()=>console.log("Connected to DB"))

app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: url
    })
}))

app.use(productRouter)
app.use(userRouter)

app.get('/',(req,res)=>{
    console.log("request received!!!")
    res.render('index.ejs',{title:"Home"})
    
})


