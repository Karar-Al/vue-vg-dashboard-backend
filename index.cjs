const http = require("http");
const WebSocket = require("ws");

const {
  loginErrorMessage,
  defaultErrorMessage,
  loginMessage,
  weatherMessage,
  stockMessage,
  calendarMessage,
  chatMessage,
  newsMessage,
  shoppingListMessage,
} = require("./src/formatting/message.cjs");

const { userIsLoggedIn, login } = require("./src/handlers/login.cjs");
const calendarRequest = require("./src/handlers/calendar.cjs");
const getWeather = require("./src/handlers/weather.cjs");
const getUserStocks = require("./src/handlers/stocks.cjs");

const { loadStorage } = require("./src/storage.cjs");

const PORT = 8080;

loadStorage();

// Data required to be loaded before this can run.
const { chatRequest } = require("./src/handlers/chat.cjs");
const { getNews } = require("./src/handlers/news.cjs");
const shoppingListRequest = require("./src/handlers/shopping.cjs");

const cache = {
  weather: null,
  stocks: {},
  calendar: {},
  intervalIDsByIP: {},
  chat: null,
  news: null,
  shoppingList: {},
};

/**
 * @param {WebSocket.Server} wsServer
 * @param {string} ip
 */
function getWSClientByIP(wsServer, ip) {
  /**
   * @type {Array<WebSocket.WebSocket & { _ip: string, _name: string }>}
   */
  // @ts-ignore
  const clients = Array.from(wsServer.clients);

  for (let index = 0; index < clients.length; index++) {
    const client = clients[index];

    if (client._ip === ip) return client;
  }
}

/**
 * @param {WebSocket.Server} wsServer
 * @param {string} name
 * @param {string} ip
 */
function getUserData(wsServer, name, ip) {
  const client = getWSClientByIP(wsServer, ip);

  if (client == null) clearInterval(cache.intervalIDsByIP[ip]);
  else {
    getUserStocks(name, (data) => {
      client.send(stockMessage(data));
    });

    getNews((data) => {
      client.send(newsMessage(data))
    });
  }
}

const httpServer = http.createServer(function httpConnection(req, res) {
  if (req.method == "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, PUT, GET, POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
  } else {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
  }

  // Weather endpoint
  // FUTURE TODO: ADD IMPLEMENTATION TO QUERY GEOLOCATIONS AND CHANGE LOCATION.

  // Stocks endpoint
  // FUTURE TODO: ADD IMPLEMENTATION TO QUERY STOCK SYMBOLS AND ADD THEM.
  // Alpha Vantage API

  // News endpoint
  // SVT RSS

  /**
   * FUTURE TODO: FINISH BELOW
   * Book recommendations endpoint
   * Send off all book recommendations
   * OpenLibrary API
   */
});

const webSocketServer = new WebSocket.Server({ server: httpServer });

webSocketServer.on("connection", function wsConnection(ws, req) {
  const connectedIP = req.socket.remoteAddress + ":" + req.socket.remotePort;

  console.log("WS#connection", connectedIP);

  ws.send(weatherMessage(cache.weather));

  ws.send(newsMessage(cache.news));

  ws.send(stockMessage(cache.stocks.default));

  ws.send(calendarMessage(cache.calendar.default));

  ws.send(chatMessage(cache.chat));
  
  ws.send(shoppingListMessage(cache.shoppingList.default));

  ws.on("message", (data, _) => {
    /**
     * @type {{ type: 'Error'|'Login'|'Weather'|'Stocks'|'Calendar'|'Calendar/NewEntry'|'Calendar/UpdateEntry'|'News'|'Books'|'Chat'|'Shopping', data: any }}
     */
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString("utf-8"));
    } catch (error) {
      ws.send(
        defaultErrorMessage({
          error: "PARSING_ERROR",
          data: "Could not parse your request to a JS object.",
        })
      );
    }

    // Not logged in.

    if (parsedData.type === "Login") {
      // @ts-ignore
      const userData = login(ws, parsedData.data, connectedIP);

      // Send initial or cached data.
      if (cache.intervalIDsByIP[connectedIP]) {
        clearInterval(cache.intervalIDsByIP[connectedIP]);
      } else {
        // Stocks

        if (cache.stocks[userData.name]) {
          ws.send(stockMessage(cache.stocks[userData.name]));
        } else {
          // @ts-ignore
          getUserStocks(userData.name, (data) => {
            // @ts-ignore
            cache.stocks[userData.name] = data;
            ws.send(stockMessage(data));
          });
        }
      }

      
      ws.send(calendarMessage(calendarRequest(userData.name, null)));
  
      ws.send(shoppingListMessage(shoppingListRequest(userData.name, null)));

      // Initialize user-specific intervals
      const id = setInterval(
        () => getUserData(this, userData.name, connectedIP),
        1000 * 60 * 60
      );
      cache.intervalIDsByIP[connectedIP] = id;

      return ws.send(loginMessage({ success: true, data: userData }));
    }

    if (!userIsLoggedIn(this, connectedIP)) {
      ws.send(
        loginErrorMessage({
          error: "NOT_LOGGED_IN",
          data: "You're not logged in!",
        })
      );
      return;
    }

    // Otherwise, logged in.

    // @ts-ignore
    const username = ws._name

    if (parsedData.type.split("/")[0] === "Calendar") {
      // @ts-ignore
      const newCalendarData = calendarRequest(username, parsedData);
      this.clients.forEach((client) => {
        // @ts-ignore
        if (client._name === username) {
          client.send(calendarMessage(newCalendarData));
        }
      });
    }

    if (parsedData.type === "Chat") {
      const newChatData = chatRequest(username, parsedData.data);

      this.clients.forEach((client) => {
        client.send(chatMessage(newChatData));
      });
    }

    if (parsedData.type.split("/")[0] === "Shopping") {
      // @ts-ignore
      const newShoppingListData = shoppingListRequest(username, parsedData);

      cache.shoppingList[username] = newShoppingListData

      this.clients.forEach((client) => {
        // @ts-ignore
        if (client._name === username) {
          client.send(shoppingListMessage(newShoppingListData));
        }
      });
    }
  });

  setInterval(() => {
    console.log("Getting new data, will do again in 1 hour.");
    getWeather((weatherRes) => {
      cache.weather = weatherRes;
      this.clients.forEach((client) => {
        client.send(weatherMessage(cache.weather));
      });
    });
  }, 1000 * 60 * 60);
});

// Setup the caches.
setImmediate(() => {
  console.log("Getting base data.");
  getWeather((weatherRes) => {
    cache.weather = weatherRes;
  });
  getUserStocks("default", (data) => {
    cache.stocks.default = data;
  });

  cache.calendar.default = calendarRequest("default", null);

  cache.chat = chatRequest("", null);

  getNews((data) => {
    cache.news = data
  })

  cache.shoppingList.default = shoppingListRequest("default", null)
});

httpServer.listen(PORT);
