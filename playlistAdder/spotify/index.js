const axios = require('axios')
const errorHandler = require('./errorHandler')

const getData = (_) => _.data

async function initialize (opts = {}) {
  const { getAuthHeader } = await require('./accessToken')()

  const requestBase = async () => (
    { headers: { Authorization: await getAuthHeader() } }
  )

  async function getTrack (track) {
    const trackReq = await requestBase()
    trackReq.method = 'get'
    trackReq.url = `https://api.spotify.com/v1/tracks/${track}`
    const trackData = await axios(trackReq).catch(errorHandler)

    return trackData.data
  }

  async function getPlaylistTracks (playlist) {
    const req = await requestBase()
    req.method = 'get'
    req.url = `https://api.spotify.com/v1/playlists/${playlist}/tracks`
    const data = await axios(req).then((res) => res.data)
    return data
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

  return {
    getTrack: getTrack,
    getPlaylistTracks: getPlaylistTracks,
    addTrackToPlaylist: addTrackToPlaylist
  }
}

module.exports = initialize
