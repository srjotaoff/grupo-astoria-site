import { Request, Response } from 'express'
import { gerarToken } from '../../../../packages/core/auth/jwt'
import {
  countActiveSessions,
  createSession,
  getMaxConcurrentSessions,
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
  const { username, senha } = assertValidCredentialsInput(req.body?.username, req.body?.senha)
  const admin = await validateDatabaseAdminCredentials(username, senha)

  const activeSessions = await countActiveSessions(admin.id)
  const maxConcurrentSessions = getMaxConcurrentSessions()
  if (activeSessions >= maxConcurrentSessions) {
    throw new AppError(`Limite de ${maxConcurrentSessions} sessoes ativas atingido para este usuario.`, 409)
  }

  const ip = req.ip ?? req.socket.remoteAddress
  const userAgent = req.headers['user-agent']
  const { token: sessionToken } = await createSession(admin.id, ip, userAgent)

  const jwtToken = gerarToken({ sub: String(admin.id), username: admin.username, role: admin.role, sid: sessionToken })

  res.cookie('admin_token', jwtToken, getCookieOptions())
  return res.status(200).json({ ok: true })
}

export function me(req: Request, res: Response) {
  return res.status(200).json({
    authenticated: true,
    admin: { sub: req.admin!.sub, username: req.admin!.username, role: req.admin!.role }
  })
}

export async function logout(req: Request, res: Response) {
  if (req.admin?.sid) {
    await invalidateSession(req.admin.sid)
  }
  res.clearCookie('admin_token', { path: '/' })
  return res.status(200).json({ ok: true })
}
