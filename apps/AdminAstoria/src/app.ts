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
      // Deny disallowed origins gracefully (no Access-Control-Allow-Origin header)
      // instead of throwing, which would surface as a 500 on every request that
      // carries an Origin header — notably same-origin @font-face requests, which
      // the browser always sends in CORS mode.
      return callback(null, isOriginAllowed(origin))
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

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_acesso.html'))
})
app.get('/cartaz-rotativo', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_adm_cartaz_rotativo.html'))
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