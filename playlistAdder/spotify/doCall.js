const axios = require('axios')
const errorHandler = require('./errorHandler')

function doCall (req) {
  req.timeout = 10000
  return axios(req).catch(errorHandler)
}

module.exports = doCall
