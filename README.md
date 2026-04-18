# grupo-astoria-site

## Admin auth JWT (cookie httpOnly + Database)

### Configuracao
Crie `apps/Admin/.env` baseado em `apps/Admin/.env.example`.

Variaveis obrigatorias:
- `PORT_ADMIN` - porta do servidor Admin
- `NODE_ENV` - `development` ou `production`
- `ALLOWED_ORIGIN` - origem permitida (ex: `http://localhost:3001`)
- `JWT_SECRET` - segredo para assinar JWT (mínimo 32 caracteres aleatórios)
- `JWT_EXPIRES_IN` - expiração do token (ex: `1h`)
- `JWT_ISSUER` - emissor do token JWT
- `JWT_AUDIENCE` - audiência do token JWT
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - credenciais MySQL

### Fluxo de autenticacao
1. `POST /auth/login` com `{ "cpf": "00000000000", "senha": "sua_senha" }`
2. Backend consulta tabela `PC_USUARI` no banco de dados
3. Se CPF e senha forem válidos, gera JWT e define cookie `admin_token`
   - Cookie com `httpOnly` + `SameSite=Strict` + `Secure` (em produção)
4. Requisições subsequentes incluem automaticamente o cookie
5. `GET /auth/me` retorna dados do admin autenticado
6. `POST /auth/logout` limpa o cookie
7. `GET /admin/dashboard` exige autenticacao válida

### Pagina de teste
Com o Admin rodando:

```powershell
npx tsx apps/Admin/server.ts
```

Abra `http://localhost:3001/` para acessar a página de teste.

Nela você pode:
- Fazer login com CPF e senha do banco
- Visualizar dados da sessão (`/auth/me`)
- Fazer logout
