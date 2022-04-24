const request = require('request')
function generateLocations(input,cb){
    const geoPrefix='https://api.mapbox.com/geocoding/v5/mapbox.places/'
    const trip=input //assign data passed into function as a variable
    const geoKey='pk.eyJ1Ijoibmlja2J1cmdlciIsImEiOiJja3pwc3lvbzcxN3hwMnVtZ2tzczdvYXZuIn0.D1XwzVp2bs7anzazNsMDGw' //my api key

    let locations = [] //create empty array to store locations

    for(let i = 0;i<trip.length;i++){ //depending on how many locations are provided, make that many requests to api
        const geoURL = geoPrefix+trip[i]+'.json?access_token='+geoKey //update URL to current location 

        request({url: geoURL},(error,response)=>{ //make request to api
            if(error){
                console.log(error)
                cb({error:error},undefined)
            }
            else{ //if not error
                const data = JSON.parse(response.body) //store response in variable
                if(!data.features){
                    console.log("Invalid Location.")
                    cb({error:'Invalid Location'},undefined)
                }
                else{ //if valid location

                    //store lat,lon,name of location in variable
                    const lat=data.features[0].center[1] 
                    const lon=data.features[0].center[0]
                    const name = data.features[0].place_name

                    let location = {}//create obj to store data from each location

                    location.id= i //create id used to sort due to call being async

                    //assign properites of each location to obj
                    location.name = name
                    location.lat = lat
                    location.lon = lon

                    locations.push(location)//push each location obj into locations array

                    locations.sort((a,b)=> a.id-b.id) //sort locations array based on id to keep correct order of locations

                    if(locations.length === trip.length) //if all locations have been added to locations array
                        cb(undefined,{locations:locations}) //send locations array
                }
                
            }
            
        })
    }
    
    
}

module.exports = generateLocations //export function
