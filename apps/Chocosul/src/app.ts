import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import { db } from '../../../packages/core/database/knex'
import { AppError } from '../../../packages/core/errors/AppError'

const app = express()

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'http://localhost:3002')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

function detectMimeType(buf: Buffer): string {
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  if (buf.length >= 3 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif'
  if (buf.toString('utf8', 0, 256).toLowerCase().includes('<svg')) return 'image/svg+xml'
  return 'application/octet-stream'
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

// Public API routes (used by Chocosul frontend to load dynamic images)
app.get('/api/parceiros', async (req, res, next) => {
  try {
    const empresa = typeof req.query.empresa === 'string' && req.query.empresa.trim()
      ? req.query.empresa.trim()
      : 'Chocosul'
    const includeDetails = String(req.query.detalhes || '') === '1'

    const columns = includeDetails ? ['id', 'nome', 'descricao'] : ['id', 'nome']
    const rows = await db('parceiros').select(...columns).where({ empresa }).orderBy('id', 'desc')

    const parceiros = rows.map((row: any) => {
      const payload: Record<string, unknown> = {
        id: Number(row.id),
        nome: String(row.nome || ''),
      }

      if (includeDetails) {
        payload.descricao = String(row.descricao || '')
      }

      return payload
    })

    return res.status(200).json({ ok: true, parceiros })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/parceiros/:id/imagem', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('ID de parceiro invalido.', 400)
    }

    const row = await db('parceiros').select('imagem').where({ id, empresa: 'Chocosul' }).first()
    if (!row?.imagem) {
      throw new AppError('Imagem nao encontrada.', 404)
    }

    const buffer = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
    res.setHeader('Content-Type', detectMimeType(buffer))
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
})

app.get('/api/banners', async (req, res, next) => {
  try {
    const empresa = typeof req.query.empresa === 'string' && req.query.empresa.trim()
      ? req.query.empresa.trim()
      : 'Chocosul'
    const rows = await db('banner').select('id', 'nome').where({ empresa }).orderBy('id', 'desc')
    const banners = rows.map((row: any) => ({ id: Number(row.id), nome: String(row.nome || '') }))
    return res.status(200).json({ ok: true, banners })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/banners/:id/imagem', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError('ID de banner invalido.', 400)
    }

    const row = await db('banner').select('imagem').where({ id, empresa: 'Chocosul' }).first()
    if (!row?.imagem) {
      throw new AppError('Imagem nao encontrada.', 404)
    }

    const buffer = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
    res.setHeader('Content-Type', detectMimeType(buffer))
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.send(buffer)
  } catch (error) {
    return next(error)
  }
})

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
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  console.error('Error:', err)
  return res.status(500).json({ message: 'Erro interno do servidor' })
})

export default app