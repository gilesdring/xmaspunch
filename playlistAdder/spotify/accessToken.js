const axios = require('axios')
const errorHandler = require('./errorHandler')
const oauth = require('./oauth')

let tokenStore
let authType

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

async function requestToken () {
  const fn = authType === 'user' ? requestUserToken : requestAppToken
  await fn()
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
  if (!tokenStore.getToken().hasOwnProperty('code')) {
    await oauth()
  } else {
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
      errorHandler(error)
    }
    tokenStore.updateToken(auth.data)
  }
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
  tokenStore = await require('./tokenStore')()
  setAuthType(userAuth ? 'user' : 'app')
  return {
    getAuthHeader
  }
}
