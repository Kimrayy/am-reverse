const express = require('express');
const statusRoute = require('./status/route');
const sendLinkRoute = require('./send-link/route');
const verifyLinkRoute = require('./verify-link/route');

const router = express.Router();

// Public contract: API-key protected by server.js.
// Health check uses the previous status handler (unchanged).
router.use('/stats', statusRoute);
// Email-link delivery uses the previous send-link handler (unchanged).
router.use('/get-link', sendLinkRoute);

// Legacy third-party authentication handler is unchanged.
// It is not presented as a supported customer-facing reseller workflow.
router.use('/verify', verifyLinkRoute);

module.exports = router;
