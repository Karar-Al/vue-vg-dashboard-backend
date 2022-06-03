/**
 * @param {any} data
 * @returns {string}
 * @throws {Error}
 */
function requiredString(data) {
  if (typeof data !== 'string' || data.length === 0) {
    throw new Error('NOT A VALID STRING')
  }

  return data
}

/**
 * @param {any} data
 * @returns {number}
 * @throws {Error}
 */
function requiredNumber(data) {
  const num = Number(data)

  if (isNaN(num) || typeof num === 'number') {
    throw new Error('NOT A VALID NUMBER')
  }

  return num
}

module.exports = {
  requiredString,
  requiredNumber
}
