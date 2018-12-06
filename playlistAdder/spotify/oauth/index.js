const { URL, URLSearchParams } = require('url')
const uuidv5 = require('uuid/v5')
const opn = require('opn')

const listener = require('./listener')

const callbackUrl = 'http://oauth.test.dring.tech:8888/oauth/'

async function openSpotifyOauth () {
  const spotifyState = uuidv5('http://oauth.test.dring.tech:8888/spotify', uuidv5.URL)
  const redirectUrl = new URL('/authorize', 'https://accounts.spotify.com')
  redirectUrl.search = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: callbackUrl,
    state: spotifyState,
    scope: 'playlist-modify-public',
    show_dialog: false
  }).toString()

  await opn(redirectUrl.toString(), { wait: false })
  const server = await listener({ callbackUrl: callbackUrl, state: spotifyState })

  let waiting = true
  server.on('close', () => {
    waiting = false
    console.log('Closed')
  })
  let count = 0
  while (waiting) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    if (count++ > 10) waiting = false
  }
}

module.exports = openSpotifyOauth
