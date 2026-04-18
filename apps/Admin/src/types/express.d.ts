import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      admin?: {
        sub: string
        cpf: string
        role: 'admin'
      }
    }
  }
}

declare global {
    namespace Express {
        interface Request {
            admin?: JwtPayload | string
        }
    }
}

