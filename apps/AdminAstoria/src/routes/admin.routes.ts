import { Router } from 'express'
import multer from 'multer'
import { verifyAdminCookieJWT } from '../middlewares/verifyAdminCookieJWT'
import {
  sessionCheck,
  createBannerHandler, deleteBannerHandler, getBannerHandler, getBannerImageHandler,
  listBannersHandler, updateBannerHandler,
} from '../controllers/admin.controller'
import { AppError } from '../../../../packages/core/errors/AppError'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      cb(new AppError('Arquivo invalido. Envie uma imagem.', 400))
      return
    }
    cb(null, true)
  },
})

// Protected API route — used by dashboard.js to verify session health
router.get('/session-check', verifyAdminCookieJWT, sessionCheck)

// ── Banners ──────────────────────────────────────────────────────────────────
router.get('/banners', verifyAdminCookieJWT, listBannersHandler)
router.get('/banners/:id/imagem', verifyAdminCookieJWT, getBannerImageHandler)
router.get('/banners/:id', verifyAdminCookieJWT, getBannerHandler)
router.post('/banners', verifyAdminCookieJWT, upload.single('imagem'), createBannerHandler)
router.patch('/banners/:id', verifyAdminCookieJWT, upload.single('imagem'), updateBannerHandler)
router.delete('/banners/:id', verifyAdminCookieJWT, deleteBannerHandler)

export default router