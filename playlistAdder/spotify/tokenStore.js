const { promisify } = require('util')
const fs = require('fs')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const tokenFile = `${__dirname}/../../token.json`

let token = {}

async function readToken () {
  try {
    token = JSON.parse(await readFile(tokenFile, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    console.error(error)
    token = {}
    writeToken()
  }
}

async function writeToken () {
  try {
    await writeFile(tokenFile, JSON.stringify(token, null, 2))
  } catch (error) {
    console.error(error)
  }
}

function getToken () {
  return token
}

async function updateToken (newValues) {
  token = { ...token, ...newValues }
  await writeToken()
}

async function initialise () {
  await readToken()
  return {
    getToken: getToken,
    updateToken: updateToken
  }
}

module.exports = initialise
