const axios = require('axios')
const errorHandler = require('./errorHandler')

let getAuthHeader

const requestBase = async () => (
  { headers: { Authorization: await getAuthHeader() } }
)

async function getTrack (track) {
  const req = await requestBase()
  req.method = 'get'
  req.url = `https://api.spotify.com/v1/tracks/${track}`
  const res = await axios(req).catch(errorHandler)

  return res.data
}

async function getPlaylist (search = /.*/) {
  const req = await requestBase()
  req.method = 'get'
  req.url = 'https://api.spotify.com/v1/me/playlists'
  const res = await axios(req).catch(errorHandler)
  console.log(res.data.items.filter(_ => _.name.match(search)))
  return res.data.items.filter(_ => _.name.match(search))
}

async function getPlaylistTracks (playlist) {
  const req = await requestBase()
  req.method = 'get'
  req.url = `https://api.spotify.com/v1/playlists/${playlist}/tracks`
  const res = await axios(req)
  return res.data
}

async function addTrackToPlaylist (track, playlist) {
  const trackUri = await getTrack(track).then((data) => data.uri).catch(errorHandler)
  const req = await requestBase()
  req.method = 'POST'
  req.url = `https://api.spotify.com/v1/playlists/${playlist}/tracks`
  req.data = { uris: [ trackUri ] }
  const res = await axios(req).catch(errorHandler)
  return res.data
}

async function initialize (opts = {}) {
  try {
    const accessToken = await require('./accessToken')()
    getAuthHeader = accessToken.getAuthHeader
  } catch (error) {
    errorHandler(error)
  }

  return {
    getTrack: getTrack,
    getPlaylistTracks: getPlaylistTracks,
    addTrackToPlaylist: addTrackToPlaylist,
    getPlaylist
  }
}

module.exports = initialize
