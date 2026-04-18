import { Request, Response } from 'express'
import { gerarToken } from '../../../../packages/core/auth/jwt'
import {
  createSession,
  getActiveSession,
  invalidateSession,
} from '../../../../packages/core/auth/session.service'
import { assertValidCredentialsInput, validateDatabaseAdminCredentials } from '../services/auth.service'
import { AppError } from '../../../../packages/core/errors/AppError'

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000,
    path: '/'
  }
}

export async function login(req: Request, res: Response) {
  const { cpf, senha } = assertValidCredentialsInput(req.body?.cpf, req.body?.senha)
  const admin = await validateDatabaseAdminCredentials(cpf, senha)

  // Block login if there is already an active session for this user
  const existing = await getActiveSession(admin.id)
  if (existing) {
    throw new AppError('Ja existe uma sessao ativa para este usuario. Encerre-a antes de fazer um novo login.', 409)
  }

  const ip = req.ip ?? req.socket.remoteAddress
  const userAgent = req.headers['user-agent']
  const { token: sessionToken } = await createSession(admin.id, ip, userAgent)

  const jwtToken = gerarToken({ sub: String(admin.id), cpf: admin.cpf, role: admin.role, sid: sessionToken })

  res.cookie('admin_token', jwtToken, getCookieOptions())
  return res.status(200).json({ ok: true })
}

export function me(req: Request, res: Response) {
  return res.status(200).json({
    authenticated: true,
    admin: { sub: req.admin!.sub, cpf: req.admin!.cpf, role: req.admin!.role }
  })
}

export async function logout(req: Request, res: Response) {
  if (req.admin?.sid) {
    await invalidateSession(req.admin.sid)
  }
  res.clearCookie('admin_token', { path: '/' })
  return res.status(200).json({ ok: true })
}
