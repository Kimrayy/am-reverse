'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { requireApiKey } = require('../lib/api-key')

const VALID_KEY = 'test_' + 'a'.repeat(64)

function run(headers, key) {
  const previous = process.env.AM_API_KEY
  if (key === undefined) delete process.env.AM_API_KEY
  else process.env.AM_API_KEY = key

  let nextCalled = false
  let responseCode = null
  let responseBody = null
  const req = {
    get(name) {
      const k = Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase())
      return k ? headers[k] : undefined
    }
  }
  const res = {
    status(code) { responseCode = code; return this },
    json(body) { responseBody = body; return this }
  }

  try {
    requireApiKey(req, res, () => { nextCalled = true })
    return { nextCalled, responseCode, responseBody }
  } finally {
    if (previous === undefined) delete process.env.AM_API_KEY
    else process.env.AM_API_KEY = previous
  }
}

test('menolak request saat API key server tidak diatur', () => {
  const r = run({}, undefined)
  assert.equal(r.responseCode, 503)
  assert.equal(r.responseBody.code, 'API_KEY_NOT_CONFIGURED')
})

test('menolak API key server yang terlalu pendek', () => {
  const r = run({}, '1234')
  assert.equal(r.responseCode, 503)
})

test('menolak request tanpa API key', () => {
  const r = run({}, VALID_KEY)
  assert.equal(r.responseCode, 401)
  assert.equal(r.nextCalled, false)
})

test('menolak request dengan API key salah', () => {
  const r = run({ 'X-API-Key': VALID_KEY + 'x' }, VALID_KEY)
  assert.equal(r.responseCode, 401)
  assert.equal(r.nextCalled, false)
})

test('mengizinkan header X-API-Key yang benar', () => {
  const r = run({ 'X-API-Key': VALID_KEY }, VALID_KEY)
  assert.equal(r.nextCalled, true)
  assert.equal(r.responseCode, null)
})

test('mengizinkan header Authorization Bearer yang benar', () => {
  const r = run({ Authorization: 'Bearer ' + VALID_KEY }, VALID_KEY)
  assert.equal(r.nextCalled, true)
  assert.equal(r.responseCode, null)
})

test('tidak membocorkan nilai API key di error', () => {
  const r = run({ 'X-API-Key': 'invalid' }, VALID_KEY)
  assert.equal(JSON.stringify(r.responseBody).includes(VALID_KEY), false)
})
