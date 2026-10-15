const express = require('express')
const sendLinkRoute = require('./send-link/route')
const verifyLinkRoute = require('./verify-link/route')

const router = express.Router()

router.use('/get-link', sendLinkRoute)
router.use('/verify', verifyLinkRoute)

module.exports = router
