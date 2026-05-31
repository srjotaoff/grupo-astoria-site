import jwt, { SignOptions } from 'jsonwebtoken'
import 'dotenv/config'

const SECRET: string = process.env.JWT_SECRET!
if (!SECRET) {
    throw new Error('JWT_SECRET environment variable is not set')
}

const ISSUER = process.env.JWT_ISSUER || 'grupo-astoria-admin'
const AUDIENCE = process.env.JWT_AUDIENCE || 'grupo-astoria-admin-users'
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn']

export function gerarToken(payload: object) {
    return jwt.sign(payload, SECRET, {
        expiresIn: EXPIRES_IN,
        issuer: ISSUER,
        audience: AUDIENCE,
        algorithm: 'HS256'
    })
}

export function verificarToken(token: string) {
    return jwt.verify(token, SECRET, {
        issuer: ISSUER,
        audience: AUDIENCE,
        algorithms: ['HS256']
    })
}