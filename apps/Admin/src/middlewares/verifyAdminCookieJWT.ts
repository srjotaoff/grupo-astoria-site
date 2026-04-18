import { NextFunction, Request, Response } from 'express'
import { verificarToken } from '../../../../packages/core/auth/jwt'
import { AppError } from '../../../../packages/core/errors/AppError'

type JwtPayload = {
  sub: string
  cpf: string
  role: 'admin'
}

function getCookieValue(cookieHeader: string | undefined, cookieName: string): string | null {
  if (!cookieHeader) return null

  const parts = cookieHeader.split(';').map((part) => part.trim())
  const target = parts.find((part) => part.startsWith(`${cookieName}=`))

  if (!target) return null

  return decodeURIComponent(target.substring(cookieName.length + 1))
}

export function verifyAdminCookieJWT(req: Request, _res: Response, next: NextFunction) {
  const token = getCookieValue(req.headers.cookie, 'admin_token')

  if (!token) {
    throw new AppError('Nao autenticado', 401)
  }

  try {
    const decoded = verificarToken(token) as JwtPayload

    if (decoded.role !== 'admin' || !decoded.cpf) {
      throw new AppError('Token invalido ou expirado', 401)
    }

    req.admin = {
      sub: decoded.sub,
      cpf: decoded.cpf,
      role: 'admin'
    }

    next()
  } catch {
    throw new AppError('Token invalido ou expirado', 401)
  }
}

