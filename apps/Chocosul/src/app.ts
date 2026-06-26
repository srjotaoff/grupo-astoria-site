import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import { db } from '../../../packages/core/database/knex'
import { AppError } from '../../../packages/core/errors/AppError'

const app = express()
const ENTERPRISE = 'Chocosul'
const ORACLE_VENDEDOR_QUERY = `
SELECT * FROM (
SELECT
  'VENDEDOR' AS TIPO_USUARIO,
  (PCUSUARI.CODUSUR||' - '||PCUSUARI.NOME) AS NOME_USUARIO,
  REGEXP_REPLACE(PCUSUARI.CPF, '[^0-9]', '') AS CPF_USUARIO,
  PCUSUARI.TELEFONE1 AS LINHA_USUARIO
FROM PCUSUARI
WHERE PCUSUARI.CPF IS NOT NULL
  AND PCUSUARI.CPF NOT IN ('000.000.000-00','111.111.111-11')
  AND PCUSUARI.CODUSUR NOT IN (
    (SELECT DISTINCT COD_CADRCA FROM PCSUPERV WHERE COD_CADRCA IS NOT NULL)
    UNION ALL
    (SELECT DISTINCT COD_CADRCA FROM PCGERENTE WHERE COD_CADRCA IS NOT NULL)
  )
  AND PCUSUARI.DTTERMINO IS NULL
  AND PCUSUARI.NOME NOT LIKE '%COBERTURA%'
  AND PCUSUARI.NOME NOT LIKE '%VAGO%'
  AND PCUSUARI.NOME NOT LIKE '%INATIVO%'
UNION ALL
SELECT
  'SUPERVISOR' AS TIPO_USUARIO,
  (PCSUPERV.CODSUPERVISOR||' - '||PCSUPERV.NOME) AS NOME_USUARIO,
  REGEXP_REPLACE(PCSUPERV.CPF, '[^0-9]', '') AS CPF_USUARIO,
  NULL AS LINHA_USUARIO
FROM PCSUPERV
WHERE PCSUPERV.CPF IS NOT NULL
  AND PCSUPERV.POSICAO = 'A'
  AND PCSUPERV.NOME NOT LIKE '%INATIVO%'
  AND PCSUPERV.NOME NOT LIKE '%VAGO%'
  AND PCSUPERV.NOME NOT LIKE '%VAGA%'
UNION ALL
SELECT
  'GERENTE' AS TIPO_USUARIO,
  (PCGERENTE.CODGERENTE||' - '||PCGERENTE.NOMEGERENTE) AS NOME_USUARIO,
  REGEXP_REPLACE(PCGERENTE.CPF, '[^0-9]', '') AS CPF_USUARIO,
  NULL AS LINHA_USUARIO
FROM PCGERENTE
WHERE PCGERENTE.CPF IS NOT NULL
  AND PCGERENTE.NOMEGERENTE NOT LIKE '%VAGO%'
UNION ALL
SELECT
  'ADMINISTRATIVO' AS TIPO_USUARIO,
  (PCEMPR.MATRICULA||' - '||PCEMPR.NOME) AS NOME_USUARIO,
  REGEXP_REPLACE(PCEMPR.CPF, '[^0-9]', '') AS CPF_USUARIO,
  PCEMPR.CELULAR AS LINHA_USUARIO
FROM PCEMPR
WHERE PCEMPR.CPF IS NOT NULL
  AND PCEMPR.SITUACAO = 'A'
  AND PCEMPR.DTDEMISSAO IS NULL
  AND PCEMPR.AREAATUACAO IN ('TI','DIRETORIA','LOGISTICA')
) WHERE CPF_USUARIO = :cpf
`

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
    const includeDetails = String(req.query.detalhes || '') === '1'

    const columns = includeDetails ? ['id', 'nome', 'descricao', 'url'] : ['id', 'nome']
    const rows = await db('parceiros').select(...columns).where({ empresa: ENTERPRISE }).orderBy('id', 'desc')

    const parceiros = rows.map((row: any) => {
      const payload: Record<string, unknown> = {
        id: Number(row.id),
        nome: String(row.nome || ''),
      }

      if (includeDetails) {
        payload.descricao = String(row.descricao || '')
        payload.url = String(row.url || '')
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

    const row = await db('parceiros').select('imagem').where({ id, empresa: ENTERPRISE }).first()
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

app.get('/api/banners', async (_req, res, next) => {
  try {
    const rows = await db('banner').select('id', 'nome').where({ empresa: ENTERPRISE }).orderBy('id', 'desc')
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

    const row = await db('banner').select('imagem').where({ id, empresa: ENTERPRISE }).first()
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

app.get('/api/portal-vendedor/usuarios', async (req, res, next) => {
  let connection: {
    execute: (sql: string, binds: Record<string, unknown>, options: { outFormat: number }) => Promise<{ rows?: any[] }>
    close: () => Promise<void>
  } | null = null

  try {
    const oracledbModule = await import('oracledb')
    const oracledb = (oracledbModule as any).default ?? oracledbModule

    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    })

    const cpfFiltro = String(req.query.cpf || '').replace(/\D/g, '')
    if (!cpfFiltro) {
      return next(new AppError('CPF nao informado.', 400))
    }

    const result = await connection.execute(ORACLE_VENDEDOR_QUERY, { cpf: cpfFiltro }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    })

    const usuarios = (result.rows || []).map((row: any) => ({
      tipo_usuario: String(row.TIPO_USUARIO || ''),
      nome_usuario: String(row.NOME_USUARIO || ''),
      cpf_usuario: String(row.CPF_USUARIO || ''),
      linha_usuario: row.LINHA_USUARIO ? String(row.LINHA_USUARIO) : null,
    }))

    return res.status(200).json({ ok: true, usuarios })
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'MODULE_NOT_FOUND') {
      return next(new AppError('Modulo oracledb nao encontrado no ambiente.', 500))
    }
    return next(error)
  } finally {
    if (connection) {
      await connection.close()
    }
  }
})

// Solicitações ativas para o portal do vendedor (agrupadas por setor no frontend)
app.get('/api/portal-vendedor/solicitacoes', async (_req, res, next) => {
  try {
    const rows = await db('solicitacao')
      .select('id', 'descricao', 'setor', 'responsavel', 'id_responsavel', 'sla')
      .orderBy('setor', 'asc')
      .orderBy('descricao', 'asc')
    const solicitacoes = rows.map((row: any) => ({
      id: Number(row.id),
      descricao: String(row.descricao || ''),
      setor: String(row.setor || ''),
      responsavel: String(row.responsavel || ''),
      id_responsavel: row.id_responsavel != null ? Number(row.id_responsavel) : null,
      sla: row.sla != null ? Number(row.sla) : null,
    }))
    return res.status(200).json({ ok: true, solicitacoes })
  } catch (error) {
    return next(error)
  }
})

// Opcoes do menu do portal do vendedor (gerenciadas no Admin)
app.get('/api/portal-vendedor/opcoes', async (_req, res, next) => {
  try {
    const rows = await db('opcoes').select('id', 'nome', 'url').where({ ativo: 1 }).orderBy('id', 'asc')
    const opcoes = rows.map((row: any) => ({
      id: Number(row.id),
      nome: String(row.nome || ''),
      url: String(row.url || ''),
    }))
    return res.status(200).json({ ok: true, opcoes })
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