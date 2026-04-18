import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))
app.use(express.json())

export default app