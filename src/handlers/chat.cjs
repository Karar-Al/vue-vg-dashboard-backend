const { data } = require("../storage.cjs");

// In-memory chat storage, yay?
const chatStorage = data.chatRooms.map((roomName) => ({
  name: roomName,
  messages: [],
}));

/**
 * @param {string} name
 * @param {{ room: string, content: string } | null} req
 */
function chatRequest(name, req) {
  if (req != null && req.room != null && name != null) {
    const foundRoomIndex = chatStorage.findIndex(chat => chat.name === req.room);

    if (foundRoomIndex > -1) {
      // New message!
      chatStorage[foundRoomIndex].messages.push({
        sentDate: Date.now(),
        author: name,
        content: req.content,
      });

      if (chatStorage[foundRoomIndex].messages.length > 50) {
        chatStorage[foundRoomIndex].messages.shift()
      }
    }
  }

  return chatStorage;
}

module.exports = { chatRequest };
