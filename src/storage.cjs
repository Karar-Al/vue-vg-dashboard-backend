// Plain JSON string file storage.

const fs = require('fs')
const path = require('path')

const fileStorageLocation = path.join(__dirname, '..', 'data.json')

/**
 * @type {{ chatRooms: string[], weather: { lon: number, lat: number }, users: Array<{ name: string, layout: any, components: { stocks: any, calendar: any, shoppingList: any } }> }}
 */
// @ts-ignore
const data = {
  users: []
}

function saveStorage () {
  return fs.writeFileSync(fileStorageLocation, JSON.stringify(data), 'utf-8')
}

function loadStorage () {
  const str = fs.readFileSync(fileStorageLocation, 'utf-8')

  const json = JSON.parse(str)

  data.users = json.users
  data.weather = json.weather

  data.chatRooms = json.chatRooms
}

module.exports = {
  data,

  saveStorage,
  loadStorage
}
