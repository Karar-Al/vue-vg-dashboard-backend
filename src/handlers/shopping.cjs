const { data, saveStorage } = require("../storage.cjs");

/**
 * @param {string} name
 * @param {{ type: 'Shopping/NewEntry'|'Shopping/RemoveEntry', data: any } | null} req
 */
function shoppingListRequest(name, req) {
  const user = data.users.find((user) => user.name === name);

  if (req != null) {
    if (req.type === "Shopping/NewEntry") {
      shoppingListAddNewEntry(user, req.data);
    } else if (req.type === "Shopping/RemoveEntry") {
      shoppingListRemoveEntry(user, req.data);
    }
  }

  return user.components.shoppingList;
}

/**
 * @param {{ id: number, amount: number, name: string }} data
 */
function shoppingListAddNewEntry(user, data) {
  user.components.shoppingList.push(data);
  saveStorage();
}

/**
 * @param {{ id: number }} data
 */
function shoppingListRemoveEntry(user, data) {
  const entryIndex = user.components.shoppingList.findIndex(
    (entry) => entry.id === data.id
  );

  if (entryIndex > -1) {
    user.components.shoppingList.splice(entryIndex, 1)
    saveStorage();
  } else {
    // Error!
  }
}

module.exports = shoppingListRequest;
