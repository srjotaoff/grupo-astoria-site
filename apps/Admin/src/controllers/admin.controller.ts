import { Request, Response } from 'express'
import {
  createEmpresa,
  deleteEmpresa,
  getEmpresaById,
  listEmpresas,
  updateEmpresa,
  validateParceiroInput,
  validateUpdateEmpresaInput,
} from '../services/parceiro.service'
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

export async function sessionCheck(_req: Request, res: Response) {
  return res.status(200).json({ ok: true })
}

// ── Empresa handlers ──────────────────────────────────────────────────────────

export async function createEmpresaHandler(req: Request, res: Response) {
  const imagemFile = req.file

  const payload = validateParceiroInput({
    nome: req.body?.nome,
    descricao: req.body?.descricao,
    empresa: req.body?.empresa,
    imagemBuffer: imagemFile?.buffer,
  })

  const empresa = await createEmpresa(payload)
  return res.status(201).json({ ok: true, id: empresa.id })
}

export async function listEmpresasHandler(_req: Request, res: Response) {
  const empresas = await listEmpresas()
  return res.status(200).json({ ok: true, empresas })
}

export async function getEmpresaHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID de empresa invalido.', 400)
  }

  const empresa = await getEmpresaById(id)
  return res.status(200).json({ ok: true, empresa })
}

export async function updateEmpresaHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateUpdateEmpresaInput({
    id: req.params.id,
    nome: req.body?.nome,
    descricao: req.body?.descricao,
    empresa: req.body?.empresa,
    imagemBuffer: imagemFile?.buffer,
  })

  await updateEmpresa(payload)
  return res.status(200).json({ ok: true })
}

export async function deleteEmpresaHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID de empresa invalido.', 400)
  }

  await deleteEmpresa(id)
  return res.status(200).json({ ok: true })
}

// ── Banner handlers ──────────────────────────────────────────────────────────

export async function createBannerHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateBannerInput({
    nome: req.body?.nome,
    empresa: req.body?.empresa,
    imagemBuffer: imagemFile?.buffer,
  })
  const banner = await createBanner(payload)
  return res.status(201).json({ ok: true, id: banner.id })
}

export async function listBannersHandler(_req: Request, res: Response) {
  const banners = await listBanners()
  return res.status(200).json({ ok: true, banners })
}

export async function getBannerHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID de banner invalido.', 400)
  }
  const banner = await getBannerById(id)
  return res.status(200).json({ ok: true, banner })
}

export async function updateBannerHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateUpdateBannerInput({
    id: req.params.id,
    nome: req.body?.nome,
    empresa: req.body?.empresa,
    imagemBuffer: imagemFile?.buffer,
  })
  await updateBanner(payload)
  return res.status(200).json({ ok: true })
}

export async function deleteBannerHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID de banner invalido.', 400)
  }
  await deleteBanner(id)
  return res.status(200).json({ ok: true })
}
