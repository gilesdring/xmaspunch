let apiCall

async function getTrack (track) {
  const req = {}
  req.method = 'get'
  req.url = `https://api.spotify.com/v1/tracks/${track}`
  const res = await apiCall(req)

  return res.data
}

async function getPlaylist (search = /.*/) {
  const req = {}
  req.method = 'get'
  req.url = 'https://api.spotify.com/v1/me/playlists'
  const res = await apiCall(req)
  console.log(res.data.items.filter(_ => _.name.match(search)))
  return res.data.items.filter(_ => _.name.match(search))
}

async function getPlaylistTracks (playlist) {
  const req = {}
  req.method = 'get'
  req.url = `https://api.spotify.com/v1/playlists/${playlist}/tracks`
  const res = await apiCall(req)
  return res.data
}

async function addTrackToPlaylist (track, playlist) {
  const trackUri = await getTrack(track).then((data) => data.uri)
  const req = {}
  req.method = 'POST'
  req.url = `https://api.spotify.com/v1/playlists/${playlist}/tracks`
  req.data = { uris: [ trackUri ] }
  const res = await apiCall(req)
  return res.data
}

async function initialize (opts = {}) {
  apiCall = await require('./apiCall')()

  return {
    getTrack: getTrack,
    getPlaylistTracks: getPlaylistTracks,
    addTrackToPlaylist: addTrackToPlaylist,
    getPlaylist
  }
}

module.exports = initialize
