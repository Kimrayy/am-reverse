'use strict'

const crypto = require('node:crypto')

function getSubmittedKey(req) {
  const apiKey = req.get('x-api-key')
  if (apiKey) return apiKey

  const authorization = req.get('authorization') || ''
  const bearer = /^Bearer\s+(\S+)$/i.exec(authorization.trim())
  return bearer ? bearer[1] : null
}

function constantTimeEqual(a, b) {
  const left = crypto.createHash('sha256').update(a, 'utf8').digest()
  const right = crypto.createHash('sha256').update(b, 'utf8').digest()
  return crypto.timingSafeEqual(left, right)
}

function requireApiKey(req, res, next) {
  const configuredKey = process.env.AM_API_KEY

  // Fail closed: never expose the API when the server secret is missing or weak.
  if (!configuredKey || configuredKey.length < 32) {
    return res.status(503).json({
      success: false,
      code: 'API_KEY_NOT_CONFIGURED',
      message: 'API key server belum dikonfigurasi.'
    })
  }

  const submittedKey = getSubmittedKey(req)
  if (!submittedKey || !constantTimeEqual(submittedKey, configuredKey)) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'API key tidak valid.'
    })
  }

  return next()
}

module.exports = { requireApiKey }
