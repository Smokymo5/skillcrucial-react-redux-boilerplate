import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'

import { unlink } from 'fs'
import cookieParser from 'cookie-parser'
import config from './config'
import Html from '../client/html'
// import { resetWarningCache } from 'prop-types'
// import { fstat } from 'fs'
// import { TestScheduler } from 'jest'

const Root = () => ''

const { readFile, writeFile, stat } = require('fs').promises

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  console.log(Root)
} catch (ex) {
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []

const port = process.env.PORT || 8090
const server = express()

const setHeaders = (req, res, next) => {
  res.set('x-skillcrucial-user', 'b32f67d5-107c-465b-b6af-ae8194b0e805')
  res.set('Access-Control-Expose-Headers', 'X-SKILLCRUCIAL-USER')
  next()
}

const middleware = [
  cors(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser(),
  setHeaders
]

middleware.forEach((it) => server.use(it))

function fileWrite(data) {
  writeFile(`${__dirname}/test.json`, JSON.stringify(data), { encording: 'utf8' })
}

function fileRead() {
  return readFile(`${__dirname}/test.json`)
    .then((it) => {
      return JSON.parse(it)
    })
    .catch(async () => {
      const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
      users.sort((a, b) => a.id - b.id)
      fileWrite(users)
      // writeFile(`${__dirname}/test.json`, JSON.stringify({ users }), { encording: 'utf8' })
      return users
    })
}

server.get('/api/v1/users', async (req, res) => {
  res.json(await fileRead())
})

server.post('/api/v1/users', async (req, res) => {
  const newUser = req.body
  const usersData = await fileRead()
  const lastUser = usersData[usersData.length - 1]
  newUser.id = lastUser ? lastUser.id + 1 : 1
  // fileWrite([...usersData, newUser])
  writeFile(`${__dirname}/test.json`, JSON.stringify([...usersData, newUser]), 'utf8')
  res.json({ status: 'success', id: newUser.id })
})

server.patch('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const newUserData = req.body
  const usersData = await fileRead()
  const obj1 = usersData.find((it) => it.id === +userId)
  const obj2 = { ...obj1, ...newUserData }
  // const arr2 = usersData.reduce((acc, rec) => {
  //   return rec.id === obj2.id ? [...acc, obj2] : [...acc, rec]
  // }, [])
  const arr2 = usersData.map((it) => {
    return it.id === obj2.id ? obj2 : it
  })
  fileWrite(arr2)
  res.json({ status: 'success', id: userId })
})

server.delete('/api/v1/users/:userId', async (req, res) => {
  const { userId } = req.params
  const usersData = await fileRead()
  try {
    const obj = usersData.find((it) => it.id === +userId)
    const usersArr = usersData.filter((it) => it.id !== obj.id)
    fileWrite(usersArr)
    res.json({ status: 'success', id: userId })
  } catch {
    res.send('some error')
  }
})

server.delete('/api/v1/users', async (req, res) => {
  await stat(`${__dirname}/test.json`)
    .then(() => {
      unlink(`${__dirname}/test.json`, () => {
        res.send('file test.json was deleted')
      })
    })
    .catch(() => {
      res.send('error: file test.json does not exist')
    })
})

server.get('/api/v1/users/take/:number', async (req, res) => {
  const { number } = req.params
  const { data: users } = await axios('https://jsonplaceholder.typicode.com/users')
  res.json(users.slice(0, +number))
})

server.get('/api/v1/users/:name', (req, res) => {
  const { name } = req.params
  res.json({ name })
})

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.on('data', async () => {})

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
console.log(`Serving at http://localhost:${port}`)
