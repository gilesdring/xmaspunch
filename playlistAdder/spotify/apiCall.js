const axios = require('axios')
const errorHandler = require('./errorHandler')
let accessToken

async function apiCall (req) {
  req.timeout = 10000

  if (!req.hasOwnProperty('headers')) req.headers = {}
  req.headers.Authorization = await accessToken.getAuthHeader()

  let res
  try {
    res = await axios(req)
  } catch (error) {
    if (error.response.status === 401) {
      // { error: { status: 401, message: 'The access token expired' } } }
      await accessToken.updateToken().catch(errorHandler)
      req.headers.Authorization = await accessToken.getAuthHeader().catch(errorHandler)
      res = await axios(req).catch(errorHandler)
    } else {
      errorHandler(error)
    }
  }
  return res
}

async function initialize () {
  accessToken = await require('./accessToken')()
  return apiCall
}

module.exports = initialize
