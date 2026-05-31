import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

import app from './src/app'

const PORT = process.env.PORT_CHOCOSUL || 3002

app.listen(PORT, () => {
  console.log(`Chocosul rodando na porta ${PORT}`)
})