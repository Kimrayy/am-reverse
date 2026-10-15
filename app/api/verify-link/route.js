const express = require('express')
const auth = require('../../../lib/auth')
const { friendlyFirebaseError } = require('../../../lib/errors')
const { incrementStats, getStats } = require('../../../lib/stats')

const router = express.Router()

router.post('/', async (req, res) => {
  const { email, magicLink } = req.body || {};
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_EMAIL',
      message: 'Email tidak valid.'
    });
  }

  if (
    typeof magicLink !== 'string' ||
    !magicLink.trim()
  ) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_MAGIC_LINK',
      message: 'Link dari email wajib diisi.'
    });
  }

  const em = email.trim().toLowerCase();
  try {
    const v = await auth.auth(em, magicLink.trim());
    if (!v.ok) {
      return res.status(400).json({
        success: false,
        code: v.why,
        message: friendlyFirebaseError(v.why)
      });
        }

  const uid = v.uid || v.user?.localId || '-'
  const premium = await auth.pro(v.id)
  const stats = premium.ok ? incrementStats() : getStats()

  const now = new Date()
  const until = new Date()
  until.setFullYear(until.getFullYear() + 1)

  return res.json({
    success: true,
    message: premium.ok ? 'verifikasi berhasil, premium aktif.' : 'login berhasil, aktivasi premium gagal.',
    data: {
      stats: stats,
      uid: v.uid,
      email: v.user?.email || em,
      emailVerified: v.user?.emailVerified ?? true,
      displayName: v.user?.displayName || null,
      photoUrl: v.user?.photoUrl || null,
      createdAt: v.user?.createdAt ? new Date(Number(v.user.createdAt)).toISOString() : null,
      lastLoginAt: v.user?.lastLoginAt ? new Date(Number(v.user.lastLoginAt)).toISOString() : now.toISOString(),
      isNewUser: v.baru,
      status: premium.ok ? 'ACTIVE' : 'INACTIVE',
      membershipStatus: premium.ok ? 'PREMIUM_ACTIVE' : 'LOGIN_ONLY',
      planName: 'Alight Motion Pro / Member',
      subscriptionType: 'Yearly VIP License',
      orderId: premium.order || null,
      activatedAt: now.toISOString(),
      validUntil: until.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntilTimestamp: until.getTime(),
      tokenType: 'Bearer',
      idToken: v.id,
      refreshToken: v.ref,
      premiumResponse: premium.ok ? premium.r : null,
      premiumError: premium.ok ? null : premium.why,
      profile: v.user || null
    }
  })
})

module.exports = router
