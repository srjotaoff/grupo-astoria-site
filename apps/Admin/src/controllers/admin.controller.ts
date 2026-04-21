import { Request, Response } from 'express'
import {
  createEmpresa,
  deleteEmpresa,
  getEmpresaById,
  listEmpresas,
  updateEmpresa,
  validateEmpresaInput,
  validateUpdateEmpresaInput,
} from '../services/empresa.service'
import { AppError } from '../../../../packages/core/errors/AppError'

export async function sessionCheck(_req: Request, res: Response) {
  return res.status(200).json({ ok: true })
}

export async function createEmpresaHandler(req: Request, res: Response) {
  const imagemFile = req.file

  const payload = validateEmpresaInput({
    nome: req.body?.nome,
    descricao: req.body?.descricao,
    parceiro: req.body?.parceiro,
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
    parceiro: req.body?.parceiro,
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
