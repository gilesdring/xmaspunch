const axios = require('axios')
const errorHandler = require('./errorHandler')
const oauth = require('./oauth')

let tokenStore

const authDetails = Buffer
  .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
  .toString('base64')

let accessToken

function generateRequest (params = {}) {
  return {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${authDetails}` },
    params: params
  }
}

async function getAppToken () {
  const signinRequest = generateRequest({ grant_type: 'client_credentials' })

  accessToken = await axios(signinRequest)
    .then((res) => res.data.access_token)
    .catch(errorHandler)
  return accessToken
}

async function getUserToken () {
  const token = tokenStore.getToken()
  const tokenReq = generateRequest({
    grant_type: 'authorization_code',
    code: token.code,
    redirect_uri: token.callbackUrl
  })

  console.log(tokenReq)

  let auth

  try {
    auth = await axios(tokenReq)
  } catch (error) {
    console.error(error.response.data)
    throw error
  }
  tokenStore.updateToken(auth.data)
}

async function updateToken () {
  const tokenReq = generateRequest({
    grant_type: 'refresh_token',
    refresh_token: tokenStore.getToken().refresh_token
  })
  const result = await axios(tokenReq)

  tokenStore.updateToken(result.data)
}

function getAuthHeader () {
  const token = tokenStore.getToken()
  const authHeader = `${token.token_type} ${token.access_token}`
  updateToken()
  return authHeader
}

module.exports = async () => {
  tokenStore = await require('./tokenStore')()
  if (!tokenStore.getToken().hasOwnProperty('code')) { await oauth() }
  if (!tokenStore.getToken().hasOwnProperty('access_token')) await getUserToken()
  return {
    getAuthHeader
  }
}
