import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import { db } from '../../../packages/core/database/knex'

const app = express()

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || 'http://localhost:3002')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const ALLOWED_ENTERPRISES = new Set(['Chocosul', 'Mastter'])

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true
  return ALLOWED_ORIGINS.includes(origin)
}

function resolveEnterprise(queryValue: unknown): string {
  const enterprise = typeof queryValue === 'string' ? queryValue.trim() : 'Chocosul'
  if (!ALLOWED_ENTERPRISES.has(enterprise)) {
    return 'Chocosul'
  }

  return enterprise
}

function detectImageMimeType(imageBuffer: Buffer): string {
  if (
    imageBuffer.length >= 12 &&
    imageBuffer[0] === 0x52 &&
    imageBuffer[1] === 0x49 &&
    imageBuffer[2] === 0x46 &&
    imageBuffer[3] === 0x46 &&
    imageBuffer[8] === 0x57 &&
    imageBuffer[9] === 0x45 &&
    imageBuffer[10] === 0x42 &&
    imageBuffer[11] === 0x50
  ) {
    return 'image/webp'
  }

  if (
    imageBuffer.length >= 8 &&
    imageBuffer[0] === 0x89 &&
    imageBuffer[1] === 0x50 &&
    imageBuffer[2] === 0x4e &&
    imageBuffer[3] === 0x47
  ) {
    return 'image/png'
  }

  if (imageBuffer.length >= 2 && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8) {
    return 'image/jpeg'
  }

  if (
    imageBuffer.length >= 6 &&
    imageBuffer[0] === 0x47 &&
    imageBuffer[1] === 0x49 &&
    imageBuffer[2] === 0x46
  ) {
    return 'image/gif'
  }

  const asText = imageBuffer.toString('utf8', 0, 256).toLowerCase()
  if (asText.includes('<svg')) {
    return 'image/svg+xml'
  }

  return 'application/octet-stream'
}

app.use(helmet({ hsts: false }))
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

// Public content endpoints backed by the Admin tables.
app.get('/api/banners', async (req, res, next) => {
  try {
    const empresa = resolveEnterprise(req.query.empresa)
    const rows = await db('banner')
      .select('id', 'nome')
      .where({ empresa })
      .whereNotNull('imagem')
      .orderBy('id', 'desc')

    return res.status(200).json({
      ok: true,
      banners: rows.map((row: any) => ({
        id: Number(row.id),
        nome: String(row.nome || ''),
      })),
    })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/banners/:id/imagem', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID de banner invalido.' })
    }

    const row = await db('banner').select('imagem').where({ id }).first()
    if (!row?.imagem) {
      return res.status(404).json({ message: 'Imagem de banner nao encontrada.' })
    }

    const imageBuffer = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
    res.setHeader('Content-Type', detectImageMimeType(imageBuffer))
    res.setHeader('Cache-Control', 'public, max-age=300')
    return res.status(200).send(imageBuffer)
  } catch (error) {
    return next(error)
  }
})

app.get('/api/parceiros', async (req, res, next) => {
  try {
    const empresa = resolveEnterprise(req.query.empresa)
    const includeDescription = req.query.detalhes === '1'

    const query = db('parceiros')
      .select('id', 'nome')
      .where({ empresa })
      .whereNotNull('imagem')
      .orderBy('id', 'desc')
    if (includeDescription) {
      query.select('descricao')
    }

    const rows = await query
    return res.status(200).json({
      ok: true,
      parceiros: rows.map((row: any) => ({
        id: Number(row.id),
        nome: String(row.nome || ''),
        ...(includeDescription ? { descricao: String(row.descricao || '') } : {}),
      })),
    })
  } catch (error) {
    return next(error)
  }
})

app.get('/api/parceiros/:id/imagem', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'ID de parceiro invalido.' })
    }

    const row = await db('parceiros').select('imagem').where({ id }).first()
    if (!row?.imagem) {
      return res.status(404).json({ message: 'Imagem de parceiro nao encontrada.' })
    }

    const imageBuffer = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
    res.setHeader('Content-Type', detectImageMimeType(imageBuffer))
    res.setHeader('Cache-Control', 'public, max-age=300')
    return res.status(200).send(imageBuffer)
  } catch (error) {
    return next(error)
  }
})

// Header injection endpoint
app.get('/header', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../header.html'))
})

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  return res.status(500).json({ message: 'Erro interno do servidor' })
})

export default app