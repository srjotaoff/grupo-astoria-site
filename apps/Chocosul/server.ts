import app from './src/app'

const PORT = process.env.PORT_CHOCOSUL || 3002

app.listen(PORT, () => {
    console.log(`Chocosul rodando na porta ${PORT}`)
})