module.exports = (error) => {
  console.error('Error in spotifyApi')
  console.error(error.response.data)
  process.exit(1)
}
