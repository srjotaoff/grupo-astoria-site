export {}

declare global {
  namespace Express {
    interface Request {
      admin?: {
        sub: string
        cpf: string
        role: 'admin'
        sid: string
      }
    }
  }
}
