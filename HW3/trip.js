const request = require('request')
const generateWeather = require('./weather') //import weather function
function generateTrip(input,cb){
    const geoPrefix='https://api.mapbox.com/directions/v5/mapbox/driving/'
    const trip=input //assign what is passed to function to variable
    const geoKey='pk.eyJ1Ijoibmlja2J1cmdlciIsImEiOiJja3pwc3lvbzcxN3hwMnVtZ2tzczdvYXZuIn0.D1XwzVp2bs7anzazNsMDGw' //my api key
    
    let coords = [] //create empty array to store coordnates 
    let legs =[] //create empty array to store each leg of trip

    //create seperate variables to store the lat/lon of the final dest to use for weather 
    let lastLat = 0  
    let lastLon = 0

    let lastWeather = {} //object to store the weather for the final dest

    for(let i=0; i<trip.locations.length;i++){ //loop through object that was passed to function
        //grab lat+lon from each location 
        let lat = trip.locations[i].lat 
        let lon = trip.locations[i].lon

        let coord = `${lon},${lat}` //make each coordnate its own string
        coords.push(coord) //push into coord array to be used for URL

        if(i===(trip.locations.length)-1){ // if current coordnate is the coords of the final dest
            //store those in another variable as well to be used to obtain weather
            lastLat = trip.locations[i].lat
            lastLon = trip.locations[i].lon
        }
    }
    
    
    const geoURL = geoPrefix+coords.join(";")+'?access_token='+geoKey //build URL, used "coords.join(";")" to convert array of strings into single array seperated by semicolon per URL requirements
        
        let tripObj = {} //create empty tripObj
        request({url: geoURL,trip:trip},(error,response)=>{ //send api request 
            if(error){
                console.log(error)
                cb({error:error},undefined)
            }
            else{ //if not error
                const data = JSON.parse(response.body) //store response as JSON obj 
                
                const duration = data.routes[0].duration //store dist in variable
                const distance = data.routes[0].distance //store duration in variable
               
                tripObj.duration = duration //add duration to tripObj
                tripObj.distance = distance //add dist to tripObj
                
                for(let j=0; j<trip.locations.length-1;j++){ //build the rest of trip obj, loop to length-1 since you will never "start" at final dest.
                    let leg = {} //create leg obj
                    let start = {} //create start obj
                    let stop = {} //create stop obj

                    //assign properties of start to current location
                    start.idx = trip.locations[j].id 
                    start.lat = trip.locations[j].lat
                    start.lon = trip.locations[j].lon
                    start.name = trip.locations[j].name

                    //assign properties of stop to next location
                    stop.idx = trip.locations[j+1].id
                    stop.lat = trip.locations[j+1].lat
                    stop.lon = trip.locations[j+1].lon
                    stop.name = trip.locations[j+1].name
                    
                    //assign start/stop objs to leg obj
                    leg.start = start
                    leg.stop = stop

                    //assign summary properties to each leg 
                    leg.distance = data.routes[0].legs[j].distance
                    leg.duration = data.routes[0].legs[j].duration
                    leg.summary = data.routes[0].legs[j].summary

                    legs.push(leg)//push leg obj into legs array
                }
                tripObj.legs = legs //add legs to tripObj

                generateWeather(lastLat,lastLon,(error,weather)=>{ //call generate weather function, send coords of final dest to weather function
                    if(error){
                        console.log(error)
                    }else{
                        //assign weather propeties to the obj for weather of the final dest.
                        lastWeather.temp = weather.temp
                        lastWeather.real = weather.real

                        tripObj.weather = lastWeather //add weather to trip obj
                        
                        cb(undefined,{tripObj:tripObj}) //send trip obj
                    }
                })
            }
            
        })

    }
    
    


module.exports = generateTrip //export function
