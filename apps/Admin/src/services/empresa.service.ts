import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

export const ALLOWED_PARTNERS = ['Chocosul', 'Mastter'] as const
export type AllowedPartner = (typeof ALLOWED_PARTNERS)[number]

type CreateEmpresaInput = {
  nome: unknown
  descricao: unknown
  parceiro: unknown
  imagemBuffer: Buffer | undefined
}

export type CreateEmpresaPayload = {
  nome: string
  descricao: string
  parceiro: AllowedPartner
  imagem: Buffer
}

export function validateEmpresaInput(input: CreateEmpresaInput): CreateEmpresaPayload {
  const nome = typeof input.nome === 'string' ? input.nome.trim() : ''
  const descricao = typeof input.descricao === 'string' ? input.descricao.trim() : ''
  const parceiro = typeof input.parceiro === 'string' ? input.parceiro.trim() : ''

  if (!nome || !descricao || !parceiro || !input.imagemBuffer) {
    throw new AppError('Todos os campos sao obrigatorios.', 400)
  }

  if (nome.length > 200) {
    throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
  }

  if (descricao.length > 1000) {
    throw new AppError('Descricao deve ter no maximo 1000 caracteres.', 400)
  }

  if (!ALLOWED_PARTNERS.includes(parceiro as AllowedPartner)) {
    throw new AppError('Parceiro invalido. Use Chocosul ou Mastter.', 400)
  }

  return {
    nome,
    descricao,
    parceiro: parceiro as AllowedPartner,
    imagem: input.imagemBuffer,
  }
}

export async function createEmpresa(payload: CreateEmpresaPayload): Promise<{ id: number }> {
  const insertResult = await db('empresas').insert({
    nome: payload.nome,
    descricao: payload.descricao,
    imagem: payload.imagem,
    parceiro: payload.parceiro,
  })

  const rawId = Array.isArray(insertResult) ? insertResult[0] : insertResult
  const id = Number(rawId)

  return { id }
}

export type EmpresaListItem = {
  id: number
  nome: string
}

export type EmpresaDetails = {
  id: number
  nome: string
  descricao: string
  parceiro: AllowedPartner
}

type UpdateEmpresaInput = {
  id: unknown
  nome: unknown
  descricao: unknown
  parceiro: unknown
  imagemBuffer: Buffer | undefined
}

export type UpdateEmpresaPayload = {
  id: number
  nome?: string
  descricao?: string
  parceiro?: AllowedPartner
  imagem?: Buffer
}

export function validateUpdateEmpresaInput(input: UpdateEmpresaInput): UpdateEmpresaPayload {
  const id = Number(input.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID de empresa invalido.', 400)
  }

  const payload: UpdateEmpresaPayload = { id }

  if (typeof input.nome === 'string') {
    const nome = input.nome.trim()
    if (nome.length > 200) {
      throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
    }
    if (nome) payload.nome = nome
  }

  if (typeof input.descricao === 'string') {
    const descricao = input.descricao.trim()
    if (descricao.length > 1000) {
      throw new AppError('Descricao deve ter no maximo 1000 caracteres.', 400)
    }
    if (descricao) payload.descricao = descricao
  }

  if (typeof input.parceiro === 'string') {
    const parceiro = input.parceiro.trim()
    if (parceiro) {
      if (!ALLOWED_PARTNERS.includes(parceiro as AllowedPartner)) {
        throw new AppError('Parceiro invalido. Use Chocosul ou Mastter.', 400)
      }
      payload.parceiro = parceiro as AllowedPartner
    }
  }

  if (input.imagemBuffer) {
    payload.imagem = input.imagemBuffer
  }

  if (
    payload.nome === undefined &&
    payload.descricao === undefined &&
    payload.parceiro === undefined &&
    payload.imagem === undefined
  ) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return payload
}

export async function listEmpresas(): Promise<EmpresaListItem[]> {
  const rows = await db('empresas').select('id', 'nome').orderBy('id', 'desc')
  return rows.map((row: any) => ({ id: Number(row.id), nome: String(row.nome || '') }))
}

export async function getEmpresaById(id: number): Promise<EmpresaDetails> {
  const row = await db('empresas').where({ id }).first()
  if (!row) {
    throw new AppError('Empresa nao encontrada.', 404)
  }

  return {
    id: Number(row.id),
    nome: String(row.nome || ''),
    descricao: String(row.descricao || ''),
    parceiro: row.parceiro as AllowedPartner,
  }
}

export async function updateEmpresa(payload: UpdateEmpresaPayload): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (payload.nome !== undefined) updateData.nome = payload.nome
  if (payload.descricao !== undefined) updateData.descricao = payload.descricao
  if (payload.parceiro !== undefined) updateData.parceiro = payload.parceiro
  if (payload.imagem !== undefined) updateData.imagem = payload.imagem

  const updated = await db('empresas').where({ id: payload.id }).update(updateData)
  if (!updated) {
    throw new AppError('Empresa nao encontrada.', 404)
  }
}

export async function deleteEmpresa(id: number): Promise<void> {
  const deleted = await db('empresas').where({ id }).del()
  if (!deleted) {
    throw new AppError('Empresa nao encontrada.', 404)
  }
}
