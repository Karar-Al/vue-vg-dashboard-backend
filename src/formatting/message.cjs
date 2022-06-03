/**
 * @param {'Error'|'Login'|'Weather'|'Stocks'|'Calendar'|'News'|'Books'|'Chat'|'Shopping'} type
 * @param {any} data
 */
function stringifier(type, data) {
  return JSON.stringify({
    type,
    data,
  });
}

/**
 * @param {{ error: string, data: string }} data
 */
function loginErrorMessage(data) {
  return stringifier("Login", data);
}

/**
 * @param {{ success: boolean, data: any }} data
 */
function loginMessage(data) {
  return stringifier("Login", data);
}

/**
 * @param {{ weather: { icon: string, main: string, description: string } }} data
 */
function weatherMessage(data) {
  return stringifier("Weather", data);
}

/**
 * @param {{ date: string, items: Array<{ type: number, symbol: string, oldValue: number, value: number, high: number, low: number }> }} data
 */
function stockMessage(data) {
  return stringifier("Stocks", data);
}

/**
 * @param {*} data
 */
function calendarMessage(data) {
  return stringifier("Calendar", data);
}

/**
 * @param {Array<{ name: string, messages: Array<{ sentDate: number, author: string, content: string }> }>} data
 */
function chatMessage(data) {
  return stringifier("Chat", data)
}

function newsMessage(data) {
  return stringifier("News", data)
}

function shoppingListMessage(data) {
  return stringifier("Shopping", data)
}

/**
 * @param {{ error: string, data: string }} data
 */
function defaultErrorMessage(data) {
  return stringifier("Error", data);
}

module.exports = {
  loginMessage,
  loginErrorMessage,

  weatherMessage,

  stockMessage,

  calendarMessage,

  chatMessage,

  newsMessage,

  shoppingListMessage,

  defaultErrorMessage,
};
