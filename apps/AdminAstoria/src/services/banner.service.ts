import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

export const ALLOWED_ENTERPRISES = ['Chocosul', 'Astoria'] as const
export type AllowedEnterprise = (typeof ALLOWED_ENTERPRISES)[number]

type CreateBannerInput = {
  nome: unknown
  empresa: unknown
  imagemBuffer: Buffer | undefined
}

export type CreateBannerPayload = {
  nome: string
  empresa: AllowedEnterprise
  imagem: Buffer
}

export function validateBannerInput(input: CreateBannerInput): CreateBannerPayload {
  const nome = typeof input.nome === 'string' ? input.nome.trim() : ''
  const empresa = typeof input.empresa === 'string' ? input.empresa.trim() : ''

  if (!nome || !empresa || !input.imagemBuffer) {
    throw new AppError('Todos os campos sao obrigatorios.', 400)
  }

  if (nome.length > 200) {
    throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
  }

  if (!ALLOWED_ENTERPRISES.includes(empresa as AllowedEnterprise)) {
    throw new AppError('Empresa invalida. Use Chocosul ou Astoria.', 400)
  }

  return {
    nome,
    empresa: empresa as AllowedEnterprise,
    imagem: input.imagemBuffer,
  }
}

export async function createBanner(payload: CreateBannerPayload): Promise<{ id: number }> {
  const insertResult = await db('banner').insert({
    nome: payload.nome,
    imagem: payload.imagem,
    empresa: payload.empresa,
  })

  const rawId = Array.isArray(insertResult) ? insertResult[0] : insertResult
  return { id: Number(rawId) }
}

export type BannerListItem = {
  id: number
  nome: string
}

export type BannerDetails = {
  id: number
  nome: string
  empresa: AllowedEnterprise
}

type UpdateBannerInput = {
  id: unknown
  nome: unknown
  empresa: unknown
  imagemBuffer: Buffer | undefined
}

export type UpdateBannerPayload = {
  id: number
  nome?: string
  empresa?: AllowedEnterprise
  imagem?: Buffer
}

export function validateUpdateBannerInput(input: UpdateBannerInput): UpdateBannerPayload {
  const id = Number(input.id)
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('ID de banner invalido.', 400)
  }

  const payload: UpdateBannerPayload = { id }

  if (typeof input.nome === 'string') {
    const nome = input.nome.trim()
    if (nome.length > 200) {
      throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
    }
    if (nome) payload.nome = nome
  }

  if (typeof input.empresa === 'string') {
    const empresa = input.empresa.trim()
    if (empresa) {
      if (!ALLOWED_ENTERPRISES.includes(empresa as AllowedEnterprise)) {
        throw new AppError('Empresa invalida. Use Chocosul ou Astoria.', 400)
      }
      payload.empresa = empresa as AllowedEnterprise
    }
  }

  if (input.imagemBuffer) {
    payload.imagem = input.imagemBuffer
  }

  if (
    payload.nome === undefined &&
    payload.empresa === undefined &&
    payload.imagem === undefined
  ) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return payload
}

export async function listBanners(): Promise<BannerListItem[]> {
  const rows = await db('banner').select('id', 'nome').where({ empresa: 'Astoria' }).orderBy('id', 'desc')
  return rows.map((row: any) => ({ id: Number(row.id), nome: String(row.nome || '') }))
}

export async function getBannerById(id: number): Promise<BannerDetails> {
  const row = await db('banner').where({ id, empresa: 'Astoria' }).first()
  if (!row) {
    throw new AppError('Banner nao encontrado.', 404)
  }

  return {
    id: Number(row.id),
    nome: String(row.nome || ''),
    empresa: row.empresa as AllowedEnterprise,
  }
}

export async function updateBanner(payload: UpdateBannerPayload): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (payload.nome !== undefined) updateData.nome = payload.nome
  if (payload.empresa !== undefined) updateData.empresa = payload.empresa
  if (payload.imagem !== undefined) updateData.imagem = payload.imagem

  const updated = await db('banner').where({ id: payload.id, empresa: 'Astoria' }).update(updateData)
  if (!updated) {
    throw new AppError('Banner nao encontrado.', 404)
  }
}

export async function deleteBanner(id: number): Promise<void> {
  const deleted = await db('banner').where({ id, empresa: 'Astoria' }).del()
  if (!deleted) {
    throw new AppError('Banner nao encontrado.', 404)
  }
}

