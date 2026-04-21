import { Router } from 'express'
import multer from 'multer'
import { verifyAdminCookieJWT } from '../middlewares/verifyAdminCookieJWT'
import {
  createEmpresaHandler,
  deleteEmpresaHandler,
  getEmpresaHandler,
  listEmpresasHandler,
  sessionCheck,
  updateEmpresaHandler,
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

// GET route for empresas list
router.get('/empresas', verifyAdminCookieJWT, listEmpresasHandler)

// GET route for single empresa
router.get('/empresas/:id', verifyAdminCookieJWT, getEmpresaHandler)

// POST route for empresas creation
router.post('/empresas', verifyAdminCookieJWT, upload.single('imagem'), createEmpresaHandler)

// PATCH route for empresas update
router.patch('/empresas/:id', verifyAdminCookieJWT, upload.single('imagem'), updateEmpresaHandler)

// DELETE route for empresas
router.delete('/empresas/:id', verifyAdminCookieJWT, deleteEmpresaHandler)

export default router