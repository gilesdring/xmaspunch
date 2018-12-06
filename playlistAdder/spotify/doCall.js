const axios = require('axios')
const errorHandler = require('./errorHandler')

async function doCall (req) {
  let res
  try {
    res = await axios(req)
  } catch (error) {
    errorHandler(error)
  }
  return res
}

module.exports = doCall
