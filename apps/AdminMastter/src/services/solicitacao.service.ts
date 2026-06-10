import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SolicitacaoInput {
  descricao: string
  setor: string
  responsavel: string
  sla: number | null
}

export interface UpdateSolicitacaoInput extends Partial<SolicitacaoInput> {
  id: number
}

// ── Validation ────────────────────────────────────────────────────────────────

export function validateSolicitacaoInput(raw: any): SolicitacaoInput {
  const descricao = String(raw?.descricao || '').trim()
  const setor = String(raw?.setor || '').trim()
  const responsavel = String(raw?.responsavel ?? raw?.colaborador ?? '').trim()
  const slaRaw = raw?.sla ?? raw?.tempo_horas
  const sla = slaRaw != null ? Number(slaRaw) : null

  if (!descricao)   throw new AppError('Descrição da solicitação é obrigatória.', 400)
  if (!setor)       throw new AppError('Setor responsável é obrigatório.', 400)
  if (!responsavel) throw new AppError('Responsável é obrigatório.', 400)
  if (sla !== null && (!Number.isInteger(sla) || sla <= 0))
    throw new AppError('Tempo para resolução deve ser um número inteiro positivo.', 400)

  return { descricao, setor, responsavel, sla }
}

export function validateUpdateSolicitacaoInput(raw: any): UpdateSolicitacaoInput {
  const id = Number(raw?.id)
  if (!Number.isInteger(id) || id <= 0) throw new AppError('ID de solicitação inválido.', 400)

  const result: UpdateSolicitacaoInput = { id }

  if (raw?.descricao !== undefined) result.descricao = String(raw.descricao).trim()
  if (raw?.setor !== undefined) result.setor = String(raw.setor).trim()
  if (raw?.responsavel !== undefined || raw?.colaborador !== undefined) {
    result.responsavel = String(raw?.responsavel ?? raw?.colaborador ?? '').trim()
  }
  if (raw?.sla !== undefined || raw?.tempo_horas !== undefined) {
    const rawSla = raw?.sla ?? raw?.tempo_horas
    const t = rawSla != null ? Number(rawSla) : null
    if (t !== null && (!Number.isInteger(t) || t <= 0))
      throw new AppError('Tempo para resolução deve ser um número inteiro positivo.', 400)
    result.sla = t
  }

  return result
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function createSolicitacao(data: SolicitacaoInput) {
  const [id] = await db('solicitacao').insert({
    descricao: data.descricao,
    setor: data.setor,
    responsavel: data.responsavel,
    sla: data.sla,
  })
  return { id }
}

export async function listSolicitacoes() {
  return db('solicitacao').select('id', 'descricao', 'setor', 'responsavel', 'sla').orderBy('id', 'asc')
}

export async function getSolicitacaoById(id: number) {
  const row = await db('solicitacao').select('id', 'descricao', 'setor', 'responsavel', 'sla').where({ id }).first()
  if (!row) throw new AppError('Solicitação não encontrada.', 404)
  return row
}

export async function updateSolicitacao(data: UpdateSolicitacaoInput) {
  const { id, ...fields } = data
  const existing = await db('solicitacao').where({ id }).first()
  if (!existing) throw new AppError('Solicitação não encontrada.', 404)
  await db('solicitacao').where({ id }).update(fields)
}

export async function deleteSolicitacao(id: number) {
  const deleted = await db('solicitacao').where({ id }).delete()
  if (!deleted) throw new AppError('Solicitação não encontrada.', 404)
}

