
/*
    taken directly from weather app we created in class
    only change made was to put my personal api key into "weatherKey" variable
*/

const request = require('request')

function generateWeather(lat,lon,cb) {

  
    const weatherKey = 'd235cd1863723fb643574fbdb5212779'
    const units = 'imperial'

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=${units}`
    
    request({url: url}, (error, response) => {
        //console.log(response.body)
        if(error){
            console.log(error)
            cb({error:error},undefined)
        }
        else{
            const data = JSON.parse(response.body)
            if(!data.main){
                console.log(data.message)
                cb({error:data.message},undefined)
            }
            else{
                const temp = data.main.temp
                // console.log('It is currently ' + temp + ' degrees in ' + data.name)
                cb(undefined,{temp:temp,real:data.main.feels_like})
            }

        }
       
    })

}

module.exports = generateWeather