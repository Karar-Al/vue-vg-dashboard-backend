const { data, saveStorage } = require("../storage.cjs");

// For type-checking only.
const WebSocket = require("ws");

/**
 * @param {WebSocket.Server} wsServer
 * @param {string} ip
 */
function userIsLoggedIn(wsServer, ip) {
  /**
   * @type {Array<WebSocket.WebSocket & { _ip: string, _name: string }>}
   */
  // @ts-ignore
  const clients = Array.from(wsServer.clients);

  for (let index = 0; index < clients.length; index++) {
    const client = clients[index];

    if (client._ip === ip && client._name) {
      return true;
    }
  }

  return false;
}

/**
 * @param {WebSocket.WebSocket & { _ip: string, _name: string }} wsClient
 * @param {string} name
 * @param {string} ip
 * @returns {{ layout: any[], name: string, components: any }} Sends back the user layout.
 */
function login(wsClient, name, ip) {
  wsClient._name = name;
  wsClient._ip = ip;

  // FUTURE TODO: Add bcrypt & password checks.

  let foundUser = data.users.find((user) => user.name === name);

  if (foundUser == null) {
    // Default user data.
    foundUser = {
      name,
      components: {
        stocks: {
          symbols: [
            { type: 1, name: "BTC" },
            { type: 0, name: "INTC" },
          ],
        },
        calendar: [],
        shoppingList: []
      },
      layout: [
        {
          title: "Weather",
          icon: "ThermometerIcon",
          component: "WeatherContainer",
          row: 1,
          rowSpan: 1,
          column: 1,
          columnSpan: 2,
        },
        {
          title: "Gains",
          icon: "LineChartIcon",
          component: "StocksContainer",
          row: 2,
          rowSpan: 1,
          column: 1,
          columnSpan: 2,
        },
        {
          title: "Calendar",
          icon: "CalendarIcon",
          component: "CalendarCardBodyContainer",
          row: 1,
          rowSpan: 2,
          column: 3,
          columnSpan: 4,
        },
        {
          title: "News",
          icon: "Globe2Icon",
          component: "NewsContainer",
          row: 1,
          rowSpan: 2,
          column: 7,
          columnSpan: 6,
        },
        {
          title: "Book recommendations",
          icon: "BookIcon",
          component: "BooksContainer",
          row: 3,
          rowSpan: 2,
          column: 1,
          columnSpan: 6,
        },
        {
          title: "Chat",
          icon: "MessageCircleIcon",
          component: "ChatContainer",
          row: 3,
          rowSpan: 2,
          column: 7,
          columnSpan: 6,
        },
      ],
    };

    data.users.push(foundUser);

    saveStorage();
  }

  return foundUser;
}

module.exports = {
  userIsLoggedIn,
  login,
};
