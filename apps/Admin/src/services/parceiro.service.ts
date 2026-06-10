import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

export const ALLOWED_ENTERPRISES = ['Chocosul', 'Mastter'] as const
export type AllowedEnterprise = (typeof ALLOWED_ENTERPRISES)[number]

type CreateParceiroInput = {
  nome: unknown
  descricao: unknown
  empresa: unknown
  url: unknown
  imagemBuffer: Buffer | undefined
}

export type CreateParceiroPayload = {
  nome: string
  descricao: string
  empresa: AllowedEnterprise
  url?: string
  imagem: Buffer
}

export function validateParceiroInput(input: CreateParceiroInput): CreateParceiroPayload {
  const nome = typeof input.nome === 'string' ? input.nome.trim() : ''
  const descricao = typeof input.descricao === 'string' ? input.descricao.trim() : ''
  const empresa = typeof input.empresa === 'string' ? input.empresa.trim() : ''
  const url = typeof input.url === 'string' ? input.url.trim() : ''

  if (!nome || !descricao || !empresa || !input.imagemBuffer) {
    throw new AppError('Todos os campos sao obrigatorios.', 400)
  }

  if (nome.length > 200) {
    throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
  }

  if (descricao.length > 1000) {
    throw new AppError('Descricao deve ter no maximo 1000 caracteres.', 400)
  }

  if (url.length > 255) {
    throw new AppError('URL deve ter no maximo 255 caracteres.', 400)
  }

  if (url) {
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      throw new AppError('URL invalida. Informe uma URL completa (https://...).', 400)
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new AppError('URL invalida. Use http:// ou https://.', 400)
    }
  }

  if (!ALLOWED_ENTERPRISES.includes(empresa as AllowedEnterprise)) {
    throw new AppError('Empresa invalida. Use Chocosul ou Mastter.', 400)
  }

  return {
    nome,
    descricao,
    empresa: empresa as AllowedEnterprise,
    url: url || undefined,
    imagem: input.imagemBuffer,
  }
}

export async function createEmpresa(payload: CreateParceiroPayload): Promise<{ id: number }> {
  const insertResult = await db('parceiros').insert({
    nome: payload.nome,
    descricao: payload.descricao,
    imagem: payload.imagem,
    empresa: payload.empresa,
    url: payload.url ?? null,
  })

  const rawId = Array.isArray(insertResult) ? insertResult[0] : insertResult
  const id = Number(rawId)

  return { id }
}

export type EmpresaListItem = {
  id: number
  nome: string
  descricao: string
  empresa: AllowedEnterprise
  url: string
}

export type EmpresaDetails = {
  id: number
  nome: string
  descricao: string
  empresa: AllowedEnterprise
  url: string
}

type UpdateEmpresaInput = {
  id: unknown
  nome: unknown
  descricao: unknown
  empresa: unknown
  url: unknown
  imagemBuffer: Buffer | undefined
}

export type UpdateEmpresaPayload = {
  id: number
  nome?: string
  descricao?: string
  empresa?: AllowedEnterprise
  url?: string
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

  if (typeof input.empresa === 'string') {
    const empresa = input.empresa.trim()
    if (empresa) {
      if (!ALLOWED_ENTERPRISES.includes(empresa as AllowedEnterprise)) {
        throw new AppError('Empresa invalida. Use Chocosul ou Mastter.', 400)
      }
      payload.empresa = empresa as AllowedEnterprise
    }
  }

  if (typeof input.url === 'string') {
    const url = input.url.trim()
    if (url.length > 255) {
      throw new AppError('URL deve ter no maximo 255 caracteres.', 400)
    }

    if (url) {
      let parsedUrl: URL
      try {
        parsedUrl = new URL(url)
      } catch {
        throw new AppError('URL invalida. Informe uma URL completa (https://...).', 400)
      }

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new AppError('URL invalida. Use http:// ou https://.', 400)
      }

      payload.url = url
    }
  }

  if (input.imagemBuffer) {
    payload.imagem = input.imagemBuffer
  }

  if (
    payload.nome === undefined &&
    payload.descricao === undefined &&
    payload.empresa === undefined &&
    payload.url === undefined &&
    payload.imagem === undefined
  ) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return payload
}

export async function listEmpresas(): Promise<EmpresaListItem[]> {
  const rows = await db('parceiros').select('id', 'nome', 'descricao', 'empresa', 'url').where({ empresa: 'Chocosul' }).orderBy('id', 'desc')
  return rows.map((row: any) => ({
    id: Number(row.id),
    nome: String(row.nome || ''),
    descricao: String(row.descricao || ''),
    empresa: row.empresa as AllowedEnterprise,
    url: String(row.url || ''),
  }))
}

export async function getEmpresaById(id: number): Promise<EmpresaDetails> {
  const row = await db('parceiros').where({ id, empresa: 'Chocosul' }).first()
  if (!row) {
    throw new AppError('Empresa nao encontrada.', 404)
  }

  return {
    id: Number(row.id),
    nome: String(row.nome || ''),
    descricao: String(row.descricao || ''),
    empresa: row.empresa as AllowedEnterprise,
    url: String(row.url || ''),
  }
}

export async function updateEmpresa(payload: UpdateEmpresaPayload): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (payload.nome !== undefined) updateData.nome = payload.nome
  if (payload.descricao !== undefined) updateData.descricao = payload.descricao
  if (payload.empresa !== undefined) updateData.empresa = payload.empresa
  if (payload.url !== undefined) updateData.url = payload.url
  if (payload.imagem !== undefined) updateData.imagem = payload.imagem

  const updated = await db('parceiros').where({ id: payload.id, empresa: 'Chocosul' }).update(updateData)
  if (!updated) {
    throw new AppError('Empresa nao encontrada.', 404)
  }
}

export async function deleteEmpresa(id: number): Promise<void> {
  const deleted = await db('parceiros').where({ id, empresa: 'Chocosul' }).del()
  if (!deleted) {
    throw new AppError('Empresa nao encontrada.', 404)
  }
}
