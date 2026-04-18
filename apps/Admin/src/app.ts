import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import { AppError } from '../../../packages/core/errors/AppError'

const app = express()

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3001'

app.use(helmet())
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
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

app.use(express.static(path.resolve(__dirname, 'public')))
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'login.html'))
})

app.use('/auth', authRoutes)
app.use('/admin', adminRoutes)

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  return res.status(500).json({ message: 'Erro interno do servidor' })
})

export default app