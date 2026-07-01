import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

import app from './src/app'

const PORT = process.env.PORT_ASTORIA || 3005

app.listen(PORT, () => {
  console.log(`Astoria rodando na porta ${PORT}`)
})