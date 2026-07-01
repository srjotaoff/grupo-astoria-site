import { db } from '../../../../packages/core/database/knex'
import { AppError } from '../../../../packages/core/errors/AppError'

export type AdminIdentity = {
  id: number
  username: string
  role: 'admin'
}

export function sanitizeUsername(username: string): string {
  return (username || '').trim()
}

export function assertValidCredentialsInput(username: unknown, senha: unknown): { username: string; senha: string } {
  if (typeof username !== 'string' || typeof senha !== 'string') {
    throw new AppError('Credenciais invalidas', 400)
  }

  const normalizedUsername = sanitizeUsername(username)

  if (!normalizedUsername || normalizedUsername.length > 128 || senha.length < 1 || senha.length > 128) {
    throw new AppError('Credenciais invalidas', 400)
  }

  return { username: normalizedUsername, senha }
}

export async function validateDatabaseAdminCredentials(username: string, senha: string): Promise<AdminIdentity> {
  const usuario = await db('usuarios')
    .where({ cpf: username })
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
    username: usuario.cpf,
    role: 'admin'
  }
}

