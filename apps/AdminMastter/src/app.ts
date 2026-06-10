import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import { AppError } from '../../../packages/core/errors/AppError'

const app = express()

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'http://localhost:3004')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

app.use(helmet({ contentSecurityPolicy: false }))
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true
  })
)
app.use(express.json({ limit: '10kb' }))

app.use('/auth/login', (req, res, next) => {
  const now = Date.now()
  const key = req.ip || 'unknown'
  ;(global as any).__loginAttempts = (global as any).__loginAttempts || new Map<string, number[]>()
  const attempts = (global as any).__loginAttempts as Map<string, number[]>
  const list = (attempts.get(key) || []).filter((ts) => now - ts < 15 * 60 * 1000)

  if (list.length >= 10) {
    return res.status(429).json({ message: 'Muitas tentativas. Tente novamente mais tarde.' })
  }

  list.push(now)
  attempts.set(key, list)
  next()
})

// ── Static assets ─────────────────────────────────────────────────────────────
// Admin-specific stylesheets, javascripts and images (lixeira.svg etc.)
app.use('/stylesheets', express.static(path.resolve(__dirname, '../stylesheets')))
app.use('/javascripts', express.static(path.resolve(__dirname, '../javascripts')))
app.use('/images', express.static(path.resolve(__dirname, '../images')))
// Chocosul shared images as fallback (logo, icons, arrows)
app.use('/images', express.static(path.resolve(__dirname, '../../Chocosul/images')))
// Legacy public folder (login.js, dashboard.js, styles.css)
app.use(express.static(path.resolve(__dirname, 'public')))

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_acesso.html'))
})
app.get('/dashboard', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'dashboard.html'))
})
app.get('/cartaz-rotativo', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_cartaz_rotativo.html'))
})
app.get('/marcas', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_marcas.html'))
})
app.get('/opcoes-menu', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_opcoes_menu_vendedor.html'))
})
app.get('/solicitacao', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_solicitacao.html'))
})

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes)
app.use('/admin', adminRoutes)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  return res.status(500).json({ message: 'Erro interno do servidor' })
})

export default app