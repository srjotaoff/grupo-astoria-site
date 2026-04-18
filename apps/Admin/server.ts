import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

import app from './src/app'

const PORT = process.env.PORT_ADMIN || 3001

app.listen(PORT, () => {
  console.log(`Painel Admin rodando na porta ${PORT}`)
})