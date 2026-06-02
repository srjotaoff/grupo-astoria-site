import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SolicitacaoInput {
  descricao: string
  setor: string
  colaborador: string
  tempo_horas: number | null
}

export interface UpdateSolicitacaoInput extends Partial<SolicitacaoInput> {
  id: number
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateSolicitacaoInput(raw: any): SolicitacaoInput {
  const descricao   = String(raw?.descricao   || '').trim()
  const setor       = String(raw?.setor       || '').trim()
  const colaborador = String(raw?.colaborador || '').trim()
  const tempo_horas = raw?.tempo_horas != null ? Number(raw.tempo_horas) : null

  if (!descricao)   throw new AppError('Descrição da solicitação é obrigatória.', 400)
  if (!setor)       throw new AppError('Setor responsável é obrigatório.', 400)
  if (!colaborador) throw new AppError('Colaborador responsável é obrigatório.', 400)
  if (tempo_horas !== null && (!Number.isInteger(tempo_horas) || tempo_horas <= 0))
    throw new AppError('Tempo para resolução deve ser um número inteiro positivo.', 400)

  return { descricao, setor, colaborador, tempo_horas }
}

export function validateUpdateSolicitacaoInput(raw: any): UpdateSolicitacaoInput {
  const id = Number(raw?.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de solicitação inválido.', 400)

  const result: UpdateSolicitacaoInput = { id }

  if (raw?.descricao !== undefined)   result.descricao   = String(raw.descricao).trim()
  if (raw?.setor !== undefined)       result.setor       = String(raw.setor).trim()
  if (raw?.colaborador !== undefined) result.colaborador = String(raw.colaborador).trim()
  if (raw?.tempo_horas !== undefined) {
    const t = raw.tempo_horas != null ? Number(raw.tempo_horas) : null
    if (t !== null && (!Number.isInteger(t) || t <= 0))
      throw new AppError('Tempo para resolução deve ser um número inteiro positivo.', 400)
    result.tempo_horas = t
  }

  return result
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function createSolicitacao(data: SolicitacaoInput) {
  const [id] = await db('solicitacoes').insert({
    descricao:   data.descricao,
    setor:       data.setor,
    colaborador: data.colaborador,
    tempo_horas: data.tempo_horas,
  })
  return { id }
}

export async function listSolicitacoes() {
  return db('solicitacoes').select('id', 'descricao', 'setor', 'colaborador', 'tempo_horas').orderBy('id', 'asc')
}

export async function getSolicitacaoById(id: number) {
  const row = await db('solicitacoes').select('id', 'descricao', 'setor', 'colaborador', 'tempo_horas').where({ id }).first()
  if (!row) throw new AppError('Solicitação não encontrada.', 404)
  return row
}

export async function updateSolicitacao(data: UpdateSolicitacaoInput) {
  const { id, ...fields } = data
  const existing = await db('solicitacoes').where({ id }).first()
  if (!existing) throw new AppError('Solicitação não encontrada.', 404)
  await db('solicitacoes').where({ id }).update(fields)
}

export async function deleteSolicitacao(id: number) {
  const deleted = await db('solicitacoes').where({ id }).delete()
  if (!deleted) throw new AppError('Solicitação não encontrada.', 404)
}

