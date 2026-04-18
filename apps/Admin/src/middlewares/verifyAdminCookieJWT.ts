import { NextFunction, Request, Response } from 'express'
import { verificarToken } from '../../../../packages/core/auth/jwt'
import { validateAndTouchSession } from '../../../../packages/core/auth/session.service'
import { AppError } from '../../../../packages/core/errors/AppError'

type JwtPayload = {
  sub: string
  cpf: string
  role: 'admin'
  sid: string
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string): string | null {
  if (!cookieHeader) return null

  const parts = cookieHeader.split(';').map((part) => part.trim())
  const target = parts.find((part) => part.startsWith(`${cookieName}=`))

  if (!target) return null

  return decodeURIComponent(target.substring(cookieName.length + 1))
}

export async function verifyAdminCookieJWT(req: Request, _res: Response, next: NextFunction) {
  const token = getCookieValue(req.headers.cookie, 'admin_token')

  if (!token) {
    throw new AppError('Nao autenticado', 401)
  }

  let decoded: JwtPayload
  try {
    decoded = verificarToken(token) as JwtPayload
  } catch {
    throw new AppError('Token invalido ou expirado', 401)
  }

  if (decoded.role !== 'admin' || !decoded.cpf || !decoded.sid) {
    throw new AppError('Token invalido ou expirado', 401)
  }

  // Validate session in DB and refresh last_seen
  const sessionValid = await validateAndTouchSession(decoded.sid)
  if (!sessionValid) {
    throw new AppError('Sessao expirada ou invalida', 401)
  }

  req.admin = {
    sub: decoded.sub,
    cpf: decoded.cpf,
    role: 'admin',
    sid: decoded.sid,
  }

  next()
}
