const spotify = require('./spotify')

const playlist = '6dQi4XpLzXMG2k6JsaY99s'
const hopper = '7q4ioguHwE10jNUcwOMZ3N'

async function getHopperTracks (limit = 24) {
  const spotifyApi = await spotify()
  const hopperList = (await spotifyApi.getPlaylistTracks(hopper)).items

  return hopperList.slice(0, limit)
}

async function main () {
  const spotifyApi = await spotify()

  const playlistTracks = (await spotifyApi.getPlaylistTracks(playlist)).items
  const currentIds = playlistTracks.map((track) => track.track.id)

  const hopperTracks = await getHopperTracks()
  const potentialTracks = hopperTracks
    .filter((x) => !currentIds.includes(x.track.id))

  if (playlistTracks.length > 0) {
    console.log(`Current tracks:
    * ${playlistTracks.map(_ => _.track.name).join('\n    * ')}
    `)
  }

  if (potentialTracks.length > 0) {
    console.log(`Potential tracks:
    * ${potentialTracks.map(_ => _.track.name).join('\n    * ')}
    `)
  } else {
    if (potentialTracks.length === 0) throw new Error('No possible tracks')
  }

  const selected = Math.floor(Math.random() * Math.floor(potentialTracks.length))
  const track = potentialTracks[selected].track
  console.log(`Selected track ${selected}: ${track.name} (id = ${track.id})`)

  const added = await spotifyApi.addTrackToPlaylist(track.id, playlist)
  console.log(added)
}

main().catch(console.error)
