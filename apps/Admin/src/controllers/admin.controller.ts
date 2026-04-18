import { Request, Response } from 'express'

export async function login(_req: Request, res: Response) {
  return res.status(410).json({
    message: 'Endpoint descontinuado. Utilize /auth/login com CPF e senha.'
  })
}