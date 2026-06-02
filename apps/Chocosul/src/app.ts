import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'

const app = express()

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'http://localhost:3002')
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
app.use(express.static(path.resolve(__dirname, '../')))

// Routes for main pages
app.get('/', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'))
})

app.get('/sobre', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../sobre_nos.html'))
})

app.get('/portifolio', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portifolio.html'))
})

app.get('/trabalhe', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../trabalhe.html'))
})

app.get('/portal-vendedor', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../portal_vendedor_acesso.html'))
})

app.get('/portal-cliente', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../cliente.html'))
})


// Header injection endpoint
app.get('/header', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.sendFile(path.resolve(__dirname, '../header.html'))
})

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  return res.status(500).json({ message: 'Erro interno do servidor' })
})

export default app