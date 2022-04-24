const express = require("express")
const path = require('path')

const generateLocations = require('./location') //import locations function
const generateTrip = require('./trip') //import trip function

const app = express()
const port = 3000
app.listen(port)

app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.get('/',(req,res)=>{
    console.log("request received!!!")
    res.render('index.ejs',{title:"Home"})
    
})


app.get('/trip',(req,res)=>{ //what to do when form is submitted
    let trip = req.query.trip.split(',') //take input and make it into an array of locations

    generateLocations(trip,(error,locations)=>{ //call generate locations function
        if(error){
            console.log(error)
        }else{
            generateTrip(locations,(error,trip)=>{ //if not error, then call generate trip function
                if(error){
                    console.log(error)
                }else{
                    res.render('index.ejs', {trip:trip}) //if not error, re-render the screen and send the trip obj
                }
            })
        }
    }) 
})


//tester function
function tester() {
    let test = ["Empire State Building", "Yankees Stadium", "Washington Monument"] //dummy locations

    generateLocations(test,(error,locations)=>{ //generate locations for dummy locations 
        if(error)
            console.log(error)
        else{
            generateTrip(locations,(error,trip)=>{ //if not error, generate trip obj for dummy locations
                if(error)
                    console.log(error)
                else{ 
                    console.log(trip) //if not error, output trip obj
                    console.log(trip.tripObj.legs) //as well as legs array since it only show "[ [Object], [Object] ]" in output of trip bbj
                    }
                })
            }
    })
}

tester() //invoke tester function
