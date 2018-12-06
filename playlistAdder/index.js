const spotify = require('./spotify')

const testPlaylist = '6dQi4XpLzXMG2k6JsaY99s'
const realPlaylist = '5gHEoY3wy1DORBleAmNurm'

const hopper = '7q4ioguHwE10jNUcwOMZ3N'
const playlist = testPlaylist

const steve = '1Vht8pNf2IUJQRC6fBCiKw'
const joelle = '5BnakSCX1it9yVtbiBGX3j'

const errorHandler = (error) => {
  console.error(error.message)
  throw error
}

async function getTracksFromPlaylist (id) {
  const spotifyApi = await spotify()
  const tracks = (await spotifyApi.getPlaylistTracks(id)).items.map(_ => _.track)
  return tracks
}

async function addTrack (track) {
  const spotifyApi = await spotify()
  const added = await spotifyApi.addTrackToPlaylist(track.id, playlist)
  if (!added.hasOwnProperty('snapshot_id')) console.error(added)
}

async function getShortlist (limit = 24) {
  const tracks = await checkTracks(await getTracksFromPlaylist(hopper))
  const currentIds = (await getTracksFromPlaylist(playlist)).map(_ => _.id)
  return tracks.slice(0, limit).filter(_ => !currentIds.includes(_.id))
}

async function checkTracks (tracks = []) {
  const offLimits = await getTracksFromPlaylist(steve)
  offLimits.concat(await getTracksFromPlaylist(joelle))
  const rejectIds = offLimits.sort((x, y) => x.name > y.name).map(_ => _.id)
  return tracks.filter((_) => !rejectIds.includes(_.id))
}

async function main () {
  const shortlist = await getShortlist()

  console.log(['Potential Tracks:'].concat(shortlist.map(_ => _.name))
    .join('\n   * '))

  if (shortlist.length === 0) throw new Error(`No tracks available in playlist ${hopper}`)

  const selected = Math.floor(Math.random() * Math.floor(shortlist.length))

  const theTrack = shortlist[selected]

  console.log(`Selected track ${selected}: ${theTrack.name} (id = ${theTrack.id})`)

  if (process.env.ADD_TRACK) addTrack(theTrack, playlist)
}

main().catch(errorHandler)
