import { Router } from 'express'
import { login, logout, me } from '../controllers/auth.controller'
import { verifyAdminCookieJWT } from '../middlewares/verifyAdminCookieJWT'

const router = Router()

router.post('/login', login)
router.post('/logout', verifyAdminCookieJWT, logout)
router.get('/me', verifyAdminCookieJWT, me)

export default router

