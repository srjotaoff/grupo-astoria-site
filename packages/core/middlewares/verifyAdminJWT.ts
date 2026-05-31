import { Request, Response, NextFunction } from 'express'
import { verificarToken } from '../auth/jwt'
import { AppError } from '../errors/AppError'

export function verifyAdminJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError('Token não fornecido', 401)
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = verificarToken(token)
        ;(req as any).admin = decoded
        next()
    } catch {
        throw new AppError('Token inválido ou expirado', 401)
    }
}