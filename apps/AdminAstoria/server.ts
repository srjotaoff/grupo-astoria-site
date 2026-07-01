import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

import app from './src/app'

const PORT = process.env.PORT_ADMIN_ASTORIA || 3006

app.listen(PORT, () => {
  console.log(`Painel AdminAstoria rodando na porta ${PORT}`)
})