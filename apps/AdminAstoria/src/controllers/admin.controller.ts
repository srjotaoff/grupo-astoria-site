import { Request, Response } from 'express'
import { db } from '../../../../packages/core/database/knex'
import {
  createBanner,
  deleteBanner,
  getBannerById,
  listBanners,
  updateBanner,
  validateBannerInput,
  validateUpdateBannerInput,
} from '../services/banner.service'
import { AppError } from '../../../../packages/core/errors/AppError'

// ── Shared MIME helper ────────────────────────────────────────────────────────

function detectMimeType(buf: Buffer): string {
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  if (buf.length >= 3 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif'
  if (buf.toString('utf8', 0, 256).toLowerCase().includes('<svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

export async function sessionCheck(_req: Request, res: Response) {
  return res.status(200).json({ ok: true })
}

// ── Banner handlers ───────────────────────────────────────────────────────────

export async function createBannerHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateBannerInput({ nome: req.body?.nome, empresa: 'Astoria', imagemBuffer: imagemFile?.buffer })
  const banner = await createBanner(payload)
  return res.status(201).json({ ok: true, id: banner.id })
}

export async function listBannersHandler(_req: Request, res: Response) {
  const banners = await listBanners()
  return res.status(200).json({ ok: true, banners })
}

export async function getBannerHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de banner invalido.', 400)
  const banner = await getBannerById(id)
  return res.status(200).json({ ok: true, banner })
}

export async function updateBannerHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateUpdateBannerInput({ id: req.params.id, nome: req.body?.nome, empresa: 'Astoria', imagemBuffer: imagemFile?.buffer })
  await updateBanner(payload)
  return res.status(200).json({ ok: true })
}

export async function deleteBannerHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de banner invalido.', 400)
  await deleteBanner(id)
  return res.status(200).json({ ok: true })
}

export async function getBannerImageHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de banner invalido.', 400)
  const row = await db('banner').select('imagem').where({ id, empresa: 'Astoria' }).first()
  if (!row?.imagem) throw new AppError('Imagem nao encontrada.', 404)
  const buf = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
  res.setHeader('Content-Type', detectMimeType(buf))
  res.setHeader('Cache-Control', 'private, max-age=60')
  return res.send(buf)
}
