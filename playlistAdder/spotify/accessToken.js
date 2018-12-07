const errorHandler = require('./errorHandler')
const oauth = require('./oauth')
const axios = require('axios')

let tokenStore
let authType

const authDetails = Buffer
  .from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)
  .toString('base64')

function generateRequest (params = {}) {
  return {
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    headers: { Authorization: `Basic ${authDetails}` },
    params: params
  }
}

async function requestToken () {
  const fn = authType === 'user' ? requestUserToken : requestAppToken
  try {
    await fn()
  } catch (error) {
    errorHandler(error)
  }
}

async function requestAppToken () {
  const signinRequest = generateRequest({ grant_type: 'client_credentials' })

  let tokenResponse

  try {
    tokenResponse = await axios(signinRequest)
  } catch (error) {
    errorHandler(error)
  }

  console.log(tokenResponse.data)
}

async function requestUserToken () {
  if (!tokenStore.getToken().hasOwnProperty('code')) await oauth()

  const token = tokenStore.getToken()
  const tokenReq = generateRequest({
    grant_type: 'authorization_code',
    code: token.code,
    redirect_uri: token.callbackUrl
  })

  let auth

  try {
    auth = await axios(tokenReq)
  } catch (error) {
    if (error.response.data.error !== 'invalid_grant') errorHandler(error)
    await updateToken()
    auth = await axios(tokenReq).catch(errorHandler)
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

async function getAuthHeader () {
  if (!tokenStore.getToken().hasOwnProperty('access_token')) await requestToken()
  const token = tokenStore.getToken()
  const authHeader = `${token.token_type} ${token.access_token}`
  updateToken()
  return authHeader
}

async function setAuthType (type) {
  authType = type
  const token = await tokenStore.getToken()
  if (token.authType === authType) return
  // remove access_token, refresh_token, token_type, expires_in, scope
  tokenStore.updateToken({ authType: type })
}

module.exports = async (userAuth = true) => {
  try {
    tokenStore = await require('./tokenStore')()
  } catch (error) {
    console.error(error)
    throw error
  }
  setAuthType(userAuth ? 'user' : 'app')
  return {
    getAuthHeader
  }
}
