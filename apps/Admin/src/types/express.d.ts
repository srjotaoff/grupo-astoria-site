export {}

declare global {
  namespace Express {
    interface Request {
      admin?: {
        sub: string
        username: string
        role: 'admin'
        sid: string
      }
    }
  }
}
