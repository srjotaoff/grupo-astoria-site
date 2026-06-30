import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

import app from './src/app'

const PORT = process.env.PORT_MASTTER || 3003

app.listen(PORT, () => {
  console.log(`Mastter rodando na porta ${PORT}`)
})