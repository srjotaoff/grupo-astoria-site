import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

// Table: opcoes (id, nome, ativo, url)

type CreateOpcaoInput = {
  nome: unknown
  url: unknown
  ativo?: unknown
}

export type CreateOpcaoPayload = {
  nome: string
  url: string
  ativo: 0 | 1
}

function parseAtivo(value: unknown): 0 | 1 {
  if (value === false || value === 0 || value === '0' || value === 'false') return 0
  return 1
}

// Valida que a url e um link http(s) valido.
function validateUrl(url: string): void {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new AppError('Informe um link valido (ex: https://exemplo.com).', 400)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new AppError('O link deve comecar com http:// ou https://.', 400)
  }
}

export function validateOpcaoInput(input: CreateOpcaoInput): CreateOpcaoPayload {
  const nome = typeof input.nome === 'string' ? input.nome.trim() : ''
  const url = typeof input.url === 'string' ? input.url.trim() : ''

  if (!nome || !url) {
    throw new AppError('Nome e url sao obrigatorios.', 400)
  }

  if (nome.length > 200) throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)

  validateUrl(url)

  return { nome, url, ativo: parseAtivo(input.ativo) }
}

export async function createOpcao(payload: CreateOpcaoPayload): Promise<{ id: number }> {
  const insertResult = await db('opcoes').insert({
    nome: payload.nome,
    url: payload.url,
    ativo: payload.ativo,
  })
  const rawId = Array.isArray(insertResult) ? insertResult[0] : insertResult
  return { id: Number(rawId) }
}

export type OpcaoItem = {
  id: number
  nome: string
  ativo: boolean
  url: string
}

export async function listOpcoes(): Promise<OpcaoItem[]> {
  const rows = await db('opcoes').select('id', 'nome', 'ativo', 'url').orderBy('id', 'desc')
  return rows.map((row: any) => ({
    id: Number(row.id),
    nome: String(row.nome || ''),
    ativo: Boolean(row.ativo),
    url: String(row.url || ''),
  }))
}

export async function getOpcaoById(id: number): Promise<OpcaoItem> {
  const row = await db('opcoes').where({ id }).first()
  if (!row) throw new AppError('Opcao nao encontrada.', 404)
  return {
    id: Number(row.id),
    nome: String(row.nome || ''),
    ativo: Boolean(row.ativo),
    url: String(row.url || ''),
  }
}

type UpdateOpcaoInput = {
  id: unknown
  nome?: unknown
  url?: unknown
  ativo?: unknown
}

export type UpdateOpcaoPayload = {
  id: number
  nome?: string
  url?: string
  ativo?: 0 | 1
}

export function validateUpdateOpcaoInput(input: UpdateOpcaoInput): UpdateOpcaoPayload {
  const id = Number(input.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de opcao invalido.', 400)

  const payload: UpdateOpcaoPayload = { id }

  if (typeof input.nome === 'string') {
    const nome = input.nome.trim()
    if (nome.length > 200) throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
    if (nome) payload.nome = nome
  }

  if (typeof input.url === 'string') {
    const url = input.url.trim()
    if (url) {
      validateUrl(url)
      payload.url = url
    }
  }

  if (input.ativo !== undefined) {
    payload.ativo = parseAtivo(input.ativo)
  }

  if (payload.nome === undefined && payload.url === undefined && payload.ativo === undefined) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return payload
}

export async function updateOpcao(payload: UpdateOpcaoPayload): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (payload.nome !== undefined) updateData.nome = payload.nome
  if (payload.url !== undefined) updateData.url = payload.url
  if (payload.ativo !== undefined) updateData.ativo = payload.ativo

  const updated = await db('opcoes').where({ id: payload.id }).update(updateData)
  if (!updated) throw new AppError('Opcao nao encontrada.', 404)
}

export async function deleteOpcao(id: number): Promise<void> {
  const deleted = await db('opcoes').where({ id }).del()
  if (!deleted) throw new AppError('Opcao nao encontrada.', 404)
}
