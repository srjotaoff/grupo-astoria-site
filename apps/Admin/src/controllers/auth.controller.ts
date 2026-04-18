import { Request, Response } from 'express'
import { gerarToken } from '../../../../packages/core/auth/jwt'
import { assertValidCredentialsInput, validateDatabaseAdminCredentials } from '../services/auth.service'

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

  const token = gerarToken({ sub: String(admin.id), cpf: admin.cpf, role: admin.role })

  res.cookie('admin_token', token, getCookieOptions())
  return res.status(200).json({ ok: true })
}

export function me(req: Request, res: Response) {
  return res.status(200).json({
    authenticated: true,
    admin: req.admin
  })
}

export function logout(req: Request, res: Response) {
  res.clearCookie('admin_token', { path: '/' })
  return res.status(200).json({ ok: true })
}

