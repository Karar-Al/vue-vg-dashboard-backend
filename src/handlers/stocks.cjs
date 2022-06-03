const fs = require('fs')
const path = require('path')

const fetch = require("got").default
const { data } = require("../storage.cjs")

const cacheFileLocation = path.join(__dirname, '..', '..', 'stocks.json')

/**
 * @type {{ 0: { [key: string]: { date: string, symbol: string, oldValue: number, value: number, high: number, low: number } }, 1: { [key: string]: { date: string, symbol: string, oldValue: number, value: number, high: number, low: number } } }}
 */
const cache = JSON.parse(fs.readFileSync(cacheFileLocation, 'utf-8'))

const CURRENCY = "USD"

/**
 * @param {string} name
 * @param {function({ date: string, items: Array<{ type: number, symbol: string, oldValue: number, value: number, high: number, low: number }> }):void} callback
 */
async function getUserStocks(name, callback) {
  const token = process.env.ALPHAVANTAGE_TOKEN;

  /**
   * @type {{ date: string, items: Array<{ type: number, symbol: string, oldValue: number, value: number, high: number, low: number }> }}
   */
  const result = {
    date: new Date().toLocaleDateString("sv-SE"),
    items: []
  }

  let foundUser = data.users.find((user) => user.name === name)

  if (foundUser == null) {
    return
  }

  /**
   * type: 0 = Stock, type: 1 = Digital Currency
   * @type {Array<{type: 0|1, name: string }>}
   */
  const userStocks = foundUser.components.stocks.symbols
  for (let index = 0; index < userStocks.length; index++) {
    const stock = userStocks[index]

    const foundCache = cache[stock.type][stock.name]
    if (foundCache != null && foundCache.date === result.date) {
      // Give me the deets!
      result.date = result.date
      result.items.push({type: stock.type, ...foundCache})
      continue
    }

    if (stock.type === 0) {
      const res = fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stock.name}&apikey=${token}`, { method: 'GET' })

      const data = await res.json()

      try {
        const formattedData = formatStockCoreAPIResponseData(data, stock)

        cache[stock.type][stock.name] = { date: formattedData.date, ...formattedData.item }

        result.date = formattedData.date
        result.items.push(formattedData.item)
      } catch (error) {
        console.error('Ratelimit hit!', (await res).body)
      }
    } else if (stock.type === 1) {
      const res = fetch(`https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${stock.name}&market=${CURRENCY}&apikey=${token}`, { method: 'GET' })

      const data = await res.json()

      try {
        const formattedData = formatStockDigitalCurrencyAPIResponseData(data, stock)

        cache[stock.type][stock.name] = { date: formattedData.date, ...formattedData.item }

        result.date = formattedData.date
        result.items.push(formattedData.item)
      } catch (error) {
        console.error('Ratelimit hit!', (await res).body)
      }
    }
  }

  saveStocksCache()

  callback(result)
}

/**
 * @param {any} data
 * @param {{ type: 0|1, name: string }} stock
 */
function formatStockCoreAPIResponseData(data, stock) {
  const recentDate = new Date(data['Meta Data']['3. Last Refreshed']).toLocaleDateString('sv-SE')

  const entries = Object.values(data['Time Series (Daily)'])

  const recentDateEntry = entries[0]
  const prevDateEntry = entries[1]

  return {
    date: recentDate,
    item: {
      type: stock.type,
      symbol: stock.name,
      oldValue: Number(prevDateEntry['4. close']),
      value: Number(recentDateEntry['4. close']),
      high: Number(recentDateEntry['2. high']),
      low: Number(recentDateEntry['3. low']),
    }
  }
}

/**
 * @param {any} data
 * @param {{ type: 0|1, name: string }} stock
 */
function formatStockDigitalCurrencyAPIResponseData(data, stock) {
  const recentDate = new Date(data['Meta Data']['6. Last Refreshed']).toLocaleDateString('sv-SE')

  const entries = Object.values(data['Time Series (Digital Currency Daily)'])

  const recentDateEntry = entries[0]
  const prevDateEntry = entries[1]

  return {
    date: recentDate,
    item: {
      type: stock.type,
      symbol: stock.name,
      oldValue: Number(prevDateEntry[`4a. close (${CURRENCY})`]),
      value: Number(recentDateEntry[`4a. close (${CURRENCY})`]),
      high: Number(recentDateEntry[`2a. high (${CURRENCY})`]),
      low: Number(recentDateEntry[`3a. low (${CURRENCY})`]),
    }
  }
}

function saveStocksCache () {
  fs.writeFileSync(cacheFileLocation, JSON.stringify(cache))
}

module.exports = getUserStocks
