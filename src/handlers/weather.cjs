const { get } = require('https')
const { data } = require('../storage.cjs')

/**
 * @param {function({ weather: { icon: string, main: string, description: string }, main: any }):void} callback
 */
function getWeather (callback) {
  // You can install dotenv and use an .env file to load these variables.
  // Or you can just use the system's environment variables. "Miljövariabler"
  const token = process.env.OPENWEATHERMAP_TOKEN

  get(`https://api.openweathermap.org/data/2.5/weather?lat=${data.weather.lat}&lon=${data.weather.lon}&appid=${token}&units=metric`, (res) => {
    let rawData = ''

    res.setEncoding('utf8');
  
    res.on('data', (chunk) => { rawData += chunk; })

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData)

        callback({
          weather: (parsedData.weather && parsedData.weather.length > 0)
            ? parsedData.weather[0]
            : { icon: '01d', main: 'N/A', description: 'Not available' },
          main: parsedData.main
        })
      } catch (e) {
        console.error(e.message)
      }
    })
  })
}

module.exports = getWeather
