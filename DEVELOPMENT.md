# 🚀 Guia de Desenvolvimento - Grupo Astoria Site

## Estrutura do Projeto

O projeto utiliza uma arquitetura de **monorepo com múltiplas aplicações**:

```
grupo-astoria-site/
├── src/
│   └── index.ts              (Entry point - roteador de apps)
├── apps/
│   ├── Admin/                (Portal administrativo)
│   └── Chocosul/             (Site de vendas - MODERNIZADO ✅)
├── packages/
│   └── core/                 (Código compartilhado)
├── package.json              (Scripts e dependências)
└── tsconfig.json             (Configuração TypeScript)
```

## Instalação

```bash
# Instalar dependências
npm install

# Criar arquivo .env baseado na raiz
# Já deve estar configurado com APP_NAME=chocosul
```

## 🎯 Executar Aplicações

### **Padrão (Chocosul)**
```bash
npm run dev
```
Inicia a aplicação Chocosul na porta **3002**

### **Apenas Chocosul**
```bash
npm run dev:chocosul
```
Mesmo resultado que `npm run dev`

### **App Admin**
```bash
npm run dev:admin
```
Inicia o painel Admin na porta **3001**

## 🌐 URLs Disponíveis

### Chocosul (Porta 3002)
- `http://localhost:3002/` - Página inicial
- `http://localhost:3002/sobre` - Sobre nós
- `http://localhost:3002/portifolio` - Portfólio de marcas
- `http://localhost:3002/trabalhe` - Trabalhe conosco
- `http://localhost:3002/portal-vendedor` - Portal do vendedor
- `http://localhost:3002/portal-cliente` - Portal do cliente

### Admin (Porta 3001)
- `http://localhost:3001/` - Login
- `http://localhost:3001/dashboard` - Dashboard

## ⚙️ Configuração de Ambiente

Arquivo `.env` na raiz:

```env
# App a executar por padrão
APP_NAME=chocosul

# Portas
PORT_ADMIN=3001
PORT_CHOCOSUL=3002

# CORS
ALLOWED_ORIGIN=http://localhost:3002  (Para Chocosul)
ALLOWED_ORIGIN=http://localhost:3001  (Para Admin)

# Banco de dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=users

# Segurança
JWT_SECRET=seu_secret_jwt_aqui
```

## 📝 Criar Novo arquivo .env no Chocosul (Opcional)

Se precisar de configurações específicas para Chocosul:

```bash
cp apps/Chocosul/.env.example apps/Chocosul/.env
```

Conteúdo:
```env
PORT_CHOCOSUL=3002
ALLOWED_ORIGIN=http://localhost:3002
NODE_ENV=development
```

## 🔧 Desenvolvimento

### Estrutura de Aplicação (Exemplo: Chocosul)

```
apps/Chocosul/
├── server.ts              (Configuração do servidor)
├── src/
│   └── app.ts             (Configuração Express)
├── javascripts/           (Scripts do frontend)
├── stylesheets/           (CSS)
├── images/                (Imagens)
├── *.html                 (Páginas HTML)
└── .env.example           (Variáveis de exemplo)
```

### Adicionar Nova Rota

Editar `apps/Chocosul/src/app.ts`:

```typescript
app.get('/nova-pagina', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '../nova-pagina.html'))
})
```

### Adicionar Nova Página HTML

1. Criar `apps/Chocosul/nova-pagina.html`
2. Incluir skip-to-main e header
3. Adicionar rota em `src/app.ts`
4. Atualizar menu em `header.html`

## 🚀 Build e Deploy

### Build para produção
```bash
npm run build
```

Gera arquivos compilados em `dist/`

### Iniciar em produção
```bash
npm start
```

Executa `node dist/index.js`

## 📦 Dependências Principais

- **express** ^5.2.1 - Framework web
- **helmet** ^8.1.0 - Segurança HTTP
- **cors** ^2.8.6 - CORS middleware
- **dotenv** ^17.4.2 - Variáveis de ambiente
- **typescript** ^6.0.3 - Tipagem estática
- **tsx** ^4.21.0 - Executor TypeScript

## 🧪 Testes

```bash
npm test
```

(Ainda não configurado - adicionar testes conforme necessário)

## 📚 Recursos Específicos

### Chocosul (Modernizado ✅)

**Melhorias Recentes:**
- ✅ Acessibilidade WCAG 2.1 AA
- ✅ HTML semântico
- ✅ ARIA labels completos
- ✅ Menu acessível por teclado
- ✅ Skip-to-main link
- ✅ Segurança com Helmet
- ✅ CORS configurado

**Documentação:**
- `apps/Chocosul/README_MODERNIZACAO.md` - Guia de modernização
- `apps/Chocosul/MODERNIZATION.md` - Detalhes técnicos

### Admin

**Melhorias:**
- ✅ Painel administrativo
- ✅ Autenticação JWT
- ✅ Rate limiting
- ✅ Proteção de rotas

**Estrutura:**
```
apps/Admin/
├── src/
│   ├── app.ts
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   └── types/
└── public/         (Dashboard HTML/CSS/JS)
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'src/index.ts'"
- Verifique se a pasta `src/` existe
- Verifique se `src/index.ts` existe
- Execute: `npm install`

### Aplicação não inicia
- Verifique `.env` está configurado
- Verifique portas não estão em uso
- Verifique `APP_NAME` em `.env`

### CORS errors
- Verifique `ALLOWED_ORIGIN` em `.env`
- Verifique URL do frontend corresponde

### Porta já em uso
```bash
# Mudar porta em .env
PORT_CHOCOSUL=3003
```

## 📞 Suporte

Para problemas específicos:

1. **Chocosul**: Consulte `apps/Chocosul/README_MODERNIZACAO.md`
2. **Admin**: Consulte documentação no Admin
3. **Geral**: Verifique arquivo `.env` e dependências

---

**Última atualização**: 2026-05-21
**Status**: ✅ Todos os sistemas funcionando

