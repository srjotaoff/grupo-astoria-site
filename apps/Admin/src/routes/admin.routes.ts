import { Router } from 'express'
import { verifyAdminCookieJWT } from '../middlewares/verifyAdminCookieJWT'

const router = Router()

// Protected API route — used by dashboard.js to verify session health
router.get('/session-check', verifyAdminCookieJWT, (_req, res) => {
  return res.json({ ok: true })
})

export default router