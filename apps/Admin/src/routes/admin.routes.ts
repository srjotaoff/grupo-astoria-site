import { Router } from 'express'
import { login } from '../controllers/admin.controller'
import { verifyAdminCookieJWT } from '../middlewares/verifyAdminCookieJWT'

const router = Router()

router.post('/login', login)

router.get('/dashboard', verifyAdminCookieJWT, (req, res) => {
  return res.json({
    ok: true,
    message: 'Acesso autorizado ao painel administrativo',
    admin: req.admin
  })
})

export default router