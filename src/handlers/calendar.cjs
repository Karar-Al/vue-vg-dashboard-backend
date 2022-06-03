const { data, saveStorage } = require("../storage.cjs");

/**
 * @param {string} name
 * @param {{ type: 'Calendar/NewEntry'|'Calendar/UpdateEntry', data: any } | null} req
 */
function calendarRequest(name, req) {
  const user = data.users.find((user) => user.name === name);

  if (req != null) {
    if (req.type === "Calendar/NewEntry") {
      calendarAddNewEntry(user, req.data);
    } else if (req.type === "Calendar/UpdateEntry") {
      calendarUpdateEntry(user, req.data);
    }
  }

  return user.components.calendar;
}

/**
 * @param {{ id: number, startDate: number, endDate: number, name: string, reminder?: boolean }} data
 */
function calendarAddNewEntry(user, data) {
  user.components.calendar.push(data);
  saveStorage();
}

/**
 * @param {{ id: number, startDate: number, endDate: number, name: string, reminder?: boolean }} data
 */
function calendarUpdateEntry(user, data) {
  const entryIndex = user.components.calendar.findIndex(
    (entry) => entry.id === data.id
  );

  if (entryIndex > -1) {
    user.components.calendar[entryIndex] = data;
    saveStorage();
  } else {
    // Error!
  }
}

module.exports = calendarRequest;
