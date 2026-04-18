import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

export type AdminIdentity = {
  id: number
  cpf: string
  role: 'admin'
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function sanitizeCPF(cpf: string): string {
  return onlyDigits(cpf || '')
}

export function assertValidCredentialsInput(cpf: unknown, senha: unknown): { cpf: string; senha: string } {
  if (typeof cpf !== 'string' || typeof senha !== 'string') {
    throw new AppError('Credenciais invalidas', 400)
  }

  const normalizedCPF = sanitizeCPF(cpf)

  if (normalizedCPF.length !== 11 || senha.length < 1 || senha.length > 128) {
    throw new AppError('Credenciais invalidas', 400)
  }

  return { cpf: normalizedCPF, senha }
}

export async function validateDatabaseAdminCredentials(cpf: string, senha: string): Promise<AdminIdentity> {
  const usuario = await db('PC_USUARI')
    .where({ cpf })
    .select('id', 'cpf', 'password')
    .first()

  if (!usuario) {
    throw new AppError('Credenciais invalidas', 401)
  }

  const senhaOk = usuario.password === senha

  if (!senhaOk) {
    throw new AppError('Credenciais invalidas', 401)
  }

  return {
    id: usuario.id,
    cpf: usuario.cpf,
    role: 'admin'
  }
}

