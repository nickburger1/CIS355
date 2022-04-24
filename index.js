const express = require("express")
const path = require('path')
const mongoose = require('mongoose')
const productRouter = require("./routers/product")
const userRouter = require("./routers/user")

const app = express()
const port = 3000
app.listen(port)

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(express.json())
app.use(productRouter)
app.use(userRouter)

//copy the connection string for your mongodb cluster. The sample_training database contains the Zips collection
const url = 'mongodb+srv://nrburger:NHCGGRfgG9aBiJNT@cluster0.m4mar.mongodb.net/infinity-market?retryWrites=true&w=majority'

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true

},()=>console.log("Connected to DB"))



app.get('/',(req,res)=>{
    console.log("request received!!!")
    res.render('index.ejs',{title:"Home"})
    
})


