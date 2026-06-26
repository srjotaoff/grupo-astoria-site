import { Request, Response } from 'express'
import { db } from '../../../../packages/core/database/knex'
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
import {
  createOpcao,
  deleteOpcao,
  getOpcaoById,
  listOpcoes,
  updateOpcao,
  validateOpcaoInput,
  validateUpdateOpcaoInput,
} from '../services/opcoes.service'
import {
  createSolicitacao,
  deleteSolicitacao,
  getSolicitacaoById,
  listSolicitacoes,
  updateSolicitacao,
  validateSolicitacaoInput,
  validateUpdateSolicitacaoInput,
} from '../services/solicitacao.service'
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

// ── Empresa handlers ──────────────────────────────────────────────────────────

export async function createEmpresaHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateParceiroInput({
    nome: req.body?.nome,
    descricao: req.body?.descricao,
    empresa: 'Chocosul',
    url: req.body?.url,
    imagemBuffer: imagemFile?.buffer
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
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de empresa invalido.', 400)
  const empresa = await getEmpresaById(id)
  return res.status(200).json({ ok: true, empresa })
}

export async function updateEmpresaHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateUpdateEmpresaInput({
    id: req.params.id,
    nome: req.body?.nome,
    descricao: req.body?.descricao,
    empresa: undefined,
    url: req.body?.url,
    imagemBuffer: imagemFile?.buffer
  })
  payload.empresa = 'Chocosul'
  await updateEmpresa(payload)
  return res.status(200).json({ ok: true })
}

export async function deleteEmpresaHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de empresa invalido.', 400)
  await deleteEmpresa(id)
  return res.status(200).json({ ok: true })
}

export async function getEmpresaImageHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de empresa invalido.', 400)
  const row = await db('parceiros').select('imagem').where({ id, empresa: 'Chocosul' }).first()
  if (!row?.imagem) throw new AppError('Imagem nao encontrada.', 404)
  const buf = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
  res.setHeader('Content-Type', detectMimeType(buf))
  res.setHeader('Cache-Control', 'private, max-age=60')
  return res.send(buf)
}

// ── Banner handlers ───────────────────────────────────────────────────────────

export async function createBannerHandler(req: Request, res: Response) {
  const imagemFile = req.file
  const payload = validateBannerInput({ nome: req.body?.nome, empresa: 'Chocosul', imagemBuffer: imagemFile?.buffer })
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
  const payload = validateUpdateBannerInput({ id: req.params.id, nome: req.body?.nome, empresa: 'Chocosul', imagemBuffer: imagemFile?.buffer })
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
  const row = await db('banner').select('imagem').where({ id, empresa: 'Chocosul' }).first()
  if (!row?.imagem) throw new AppError('Imagem nao encontrada.', 404)
  const buf = Buffer.isBuffer(row.imagem) ? row.imagem : Buffer.from(row.imagem)
  res.setHeader('Content-Type', detectMimeType(buf))
  res.setHeader('Cache-Control', 'private, max-age=60')
  return res.send(buf)
}

// ── Opcoes handlers ───────────────────────────────────────────────────────────

export async function createOpcaoHandler(req: Request, res: Response) {
  const payload = validateOpcaoInput({ nome: req.body?.nome, url: req.body?.url, ativo: req.body?.ativo })
  const opcao = await createOpcao(payload)
  return res.status(201).json({ ok: true, id: opcao.id })
}

export async function listOpcoesHandler(_req: Request, res: Response) {
  const opcoes = await listOpcoes()
  return res.status(200).json({ ok: true, opcoes })
}

export async function getOpcaoHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de opcao invalido.', 400)
  const opcao = await getOpcaoById(id)
  return res.status(200).json({ ok: true, opcao })
}

export async function updateOpcaoHandler(req: Request, res: Response) {
  const payload = validateUpdateOpcaoInput({ id: req.params.id, nome: req.body?.nome, url: req.body?.url, ativo: req.body?.ativo })
  await updateOpcao(payload)
  return res.status(200).json({ ok: true })
}

export async function deleteOpcaoHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de opcao invalido.', 400)
  await deleteOpcao(id)
  return res.status(200).json({ ok: true })
}

// ── Solicitacao handlers ──────────────────────────────────────────────────────

export async function createSolicitacaoHandler(req: Request, res: Response) {
  const payload = validateSolicitacaoInput(req.body)
  const solicitacao = await createSolicitacao(payload)
  return res.status(201).json({ ok: true, id: solicitacao.id })
}

export async function listSolicitacoesHandler(_req: Request, res: Response) {
  const solicitacoes = await listSolicitacoes()
  return res.status(200).json({ ok: true, solicitacoes })
}

export async function getSolicitacaoHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de solicitação invalido.', 400)
  const solicitacao = await getSolicitacaoById(id)
  return res.status(200).json({ ok: true, solicitacao })
}

export async function updateSolicitacaoHandler(req: Request, res: Response) {
  const payload = validateUpdateSolicitacaoInput({ id: req.params.id, ...req.body })
  await updateSolicitacao(payload)
  return res.status(200).json({ ok: true })
}

export async function deleteSolicitacaoHandler(req: Request, res: Response) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de solicitação invalido.', 400)
  await deleteSolicitacao(id)
  return res.status(200).json({ ok: true })
}
