const { promisify } = require('util')
const writeFile = promisify(require('fs').writeFile)
const { URL, URLSearchParams } = require('url')
const express = require('express')
const uuidv5 = require('uuid/v5')

const app = express()
const port = 8888

const callbackUrl = 'http://oauth.test.dring.tech:8888/oauth/'

function spotifyOauth (req, res, next) {
  const spotifyState = uuidv5('http://oauth.test.dring.tech:8888/spotify', uuidv5.URL)
  console.log(spotifyState)
  const redirectUrl = new URL('/authorize', 'https://accounts.spotify.com')
  redirectUrl.search = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: callbackUrl,
    state: spotifyState,
    scope: 'playlist-modify-public',
    show_dialog: true
  }).toString()
  res.redirect(redirectUrl)
}

async function oauthPage (req, res, next) {
  const authFile = '../auth.json'
  const authDetails = Object.assign({ callbackUrl: callbackUrl }, req.query)
  console.log(authDetails)
  try {
    await writeFile(authFile, JSON.stringify(authDetails, null, 2))
  } catch (e) {
    console.error(e)
  }
  const pageContent = `
  <p>Saved authentication details to ${authFile}</p>
  <pre>${JSON.stringify(authDetails, null, 2)}</pre>
  `
  res.send(pageContent)
}

app.get('/spotify/', spotifyOauth)
app.get('/oauth/', oauthPage)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
