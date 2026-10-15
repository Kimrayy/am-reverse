const express = require('express')
const path = require('path')
const apiRoutes = require('./app/api/route')
const { requireApiKey } = require('./lib/api-key')

const app = express()
const PORT = Number(process.env.PORT) || 3300

app.disable('x-powered-by')
app.use(require('cors')())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate')
    }
  }
}))

// Protect every existing /api route without changing any handler, including pro().
app.use('/api', requireApiKey, apiRoutes)

app.listen(PORT, () => {
  console.log('server jalan di http://localhost:' + PORT)
})
