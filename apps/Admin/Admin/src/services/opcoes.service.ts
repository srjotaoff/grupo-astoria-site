import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

// Table: opcoes (id, nome, ativo, setor)

type CreateOpcaoInput = {
  nome: unknown
  setor: unknown
  ativo?: unknown
}

export type CreateOpcaoPayload = {
  nome: string
  setor: string
  ativo: 0 | 1
}

function parseAtivo(value: unknown): 0 | 1 {
  if (value === false || value === 0 || value === '0' || value === 'false') return 0
  return 1
}

export function validateOpcaoInput(input: CreateOpcaoInput): CreateOpcaoPayload {
  const nome = typeof input.nome === 'string' ? input.nome.trim() : ''
  const setor = typeof input.setor === 'string' ? input.setor.trim() : ''

  if (!nome || !setor) {
    throw new AppError('Nome e setor sao obrigatorios.', 400)
  }

  if (nome.length > 200) throw new AppError('Nome deve ter no maximo 200 caracteres.', 400)
  if (setor.length > 200) throw new AppError('Setor deve ter no maximo 200 caracteres.', 400)

  return { nome, setor, ativo: parseAtivo(input.ativo) }
}

export async function createOpcao(payload: CreateOpcaoPayload): Promise<{ id: number }> {
  const insertResult = await db('opcoes').insert({
    nome: payload.nome,
    setor: payload.setor,
    ativo: payload.ativo,
  })
  const rawId = Array.isArray(insertResult) ? insertResult[0] : insertResult
  return { id: Number(rawId) }
}

export type OpcaoItem = {
  id: number
  nome: string
  ativo: boolean
  setor: string
}

export async function listOpcoes(): Promise<OpcaoItem[]> {
  const rows = await db('opcoes').select('id', 'nome', 'ativo', 'setor').orderBy('id', 'desc')
  return rows.map((row: any) => ({
    id: Number(row.id),
    nome: String(row.nome || ''),
    ativo: Boolean(row.ativo),
    setor: String(row.setor || ''),
  }))
}

export async function getOpcaoById(id: number): Promise<OpcaoItem> {
  const row = await db('opcoes').where({ id }).first()
  if (!row) throw new AppError('Opcao nao encontrada.', 404)
  return {
    id: Number(row.id),
    nome: String(row.nome || ''),
    ativo: Boolean(row.ativo),
    setor: String(row.setor || ''),
  }
}

type UpdateOpcaoInput = {
  id: unknown
  nome?: unknown
  setor?: unknown
  ativo?: unknown
}

export type UpdateOpcaoPayload = {
  id: number
  nome?: string
  setor?: string
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

  if (typeof input.setor === 'string') {
    const setor = input.setor.trim()
    if (setor.length > 200) throw new AppError('Setor deve ter no maximo 200 caracteres.', 400)
    if (setor) payload.setor = setor
  }

  if (input.ativo !== undefined) {
    payload.ativo = parseAtivo(input.ativo)
  }

  if (payload.nome === undefined && payload.setor === undefined && payload.ativo === undefined) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400)
  }

  return payload
}

export async function updateOpcao(payload: UpdateOpcaoPayload): Promise<void> {
  const updateData: Record<string, unknown> = {}
  if (payload.nome !== undefined) updateData.nome = payload.nome
  if (payload.setor !== undefined) updateData.setor = payload.setor
  if (payload.ativo !== undefined) updateData.ativo = payload.ativo

  const updated = await db('opcoes').where({ id: payload.id }).update(updateData)
  if (!updated) throw new AppError('Opcao nao encontrada.', 404)
}

export async function deleteOpcao(id: number): Promise<void> {
  const deleted = await db('opcoes').where({ id }).del()
  if (!deleted) throw new AppError('Opcao nao encontrada.', 404)
}

