module.exports = (error) => {
  const thrownError = new Error('Error in spotifyApi')
  thrownError.data = error.response.data
  throw thrownError
}
