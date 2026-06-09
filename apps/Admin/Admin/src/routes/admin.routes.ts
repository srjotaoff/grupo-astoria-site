import { Router } from 'express'
import multer from 'multer'
import { verifyAdminCookieJWT } from '../middlewares/verifyAdminCookieJWT'
import {
  createEmpresaHandler, deleteEmpresaHandler, getEmpresaHandler, getEmpresaImageHandler,
  listEmpresasHandler, sessionCheck, updateEmpresaHandler,
  createBannerHandler, deleteBannerHandler, getBannerHandler, getBannerImageHandler,
  listBannersHandler, updateBannerHandler,
  createOpcaoHandler, deleteOpcaoHandler, getOpcaoHandler, listOpcoesHandler, updateOpcaoHandler,
  createSolicitacaoHandler, deleteSolicitacaoHandler, getSolicitacaoHandler,
  listSolicitacoesHandler, updateSolicitacaoHandler,
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

// ── Parceiros ────────────────────────────────────────────────────────────────
router.get('/empresas', verifyAdminCookieJWT, listEmpresasHandler)
router.get('/empresas/:id/imagem', verifyAdminCookieJWT, getEmpresaImageHandler)
router.get('/empresas/:id', verifyAdminCookieJWT, getEmpresaHandler)
router.post('/empresas', verifyAdminCookieJWT, upload.single('imagem'), createEmpresaHandler)
router.patch('/empresas/:id', verifyAdminCookieJWT, upload.single('imagem'), updateEmpresaHandler)
router.delete('/empresas/:id', verifyAdminCookieJWT, deleteEmpresaHandler)

// ── Banners ──────────────────────────────────────────────────────────────────
router.get('/banners', verifyAdminCookieJWT, listBannersHandler)
router.get('/banners/:id/imagem', verifyAdminCookieJWT, getBannerImageHandler)
router.get('/banners/:id', verifyAdminCookieJWT, getBannerHandler)
router.post('/banners', verifyAdminCookieJWT, upload.single('imagem'), createBannerHandler)
router.patch('/banners/:id', verifyAdminCookieJWT, upload.single('imagem'), updateBannerHandler)
router.delete('/banners/:id', verifyAdminCookieJWT, deleteBannerHandler)

// ── Opcoes ───────────────────────────────────────────────────────────────────
router.get('/opcoes', verifyAdminCookieJWT, listOpcoesHandler)
router.get('/opcoes/:id', verifyAdminCookieJWT, getOpcaoHandler)
router.post('/opcoes', verifyAdminCookieJWT, createOpcaoHandler)
router.patch('/opcoes/:id', verifyAdminCookieJWT, updateOpcaoHandler)
router.delete('/opcoes/:id', verifyAdminCookieJWT, deleteOpcaoHandler)

// ── Solicitacoes ──────────────────────────────────────────────────────────────
router.get('/solicitacoes', verifyAdminCookieJWT, listSolicitacoesHandler)
router.get('/solicitacoes/:id', verifyAdminCookieJWT, getSolicitacaoHandler)
router.post('/solicitacoes', verifyAdminCookieJWT, createSolicitacaoHandler)
router.patch('/solicitacoes/:id', verifyAdminCookieJWT, updateSolicitacaoHandler)
router.delete('/solicitacoes/:id', verifyAdminCookieJWT, deleteSolicitacaoHandler)

export default router