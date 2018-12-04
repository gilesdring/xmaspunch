const { promisify } = require('util')
const writeFile = promisify(require('fs').writeFile)
const express = require('express')

const app = express()
const port = 8888
let server
let callbackUrl, state

async function oauthPage (req, res, next) {
  const authFile = '../auth.json'
  const authDetails = Object.assign({ callbackUrl: callbackUrl }, req.query)
  if (authDetails.state !== state) {
    const thrownError = new Error('Provided state does not match requested state')
    thrownError.data = {
      requestedState: state,
      providedState: authDetails.state
    }
    throw thrownError
  }
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
  const timeout = 1000
  console.log(`Closing server in ${timeout / 1000}s`)
  setTimeout(function () { server.close() }, timeout)
}

app.get('/oauth/', oauthPage)

function start (options = {}) {
  if (!options.hasOwnProperty('callbackUrl')) throw new Error('Must provide \'callbackUrl\'')
  callbackUrl = options.callbackUrl
  if (options.hasOwnProperty('state')) state = options.state
  server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

module.exports = start
