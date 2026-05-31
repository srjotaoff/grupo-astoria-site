# Docker + Nginx + Portainer (Grupo Astoria)

Este guia prepara um ambiente com hot reload para `admin`, `chocosul` e `mastter`, usando 1 `Dockerfile` e roteamento por dominio no Nginx.

## 1) O que foi criado

- `Dockerfile`
- `docker-compose.yml` (desenvolvimento local)
- `docker-compose.portainer.yml` (stack no Portainer)
- `infra/nginx/default.conf`
- `.dockerignore`
- `.env.docker.example`

## 2) Preparacao local (Windows)

1. Copie `.env.docker.example` para `.env` e ajuste os valores.
2. Adicione dominios locais no arquivo `C:\\Windows\\System32\\drivers\\etc\\hosts`:

```txt
127.0.0.1 admin-astoria.local
127.0.0.1 chocosul.local
127.0.0.1 mastter.local
```

3. Suba tudo:

```powershell
docker compose up --build
```

4. Acesse:
- `http://admin-astoria.local`
- `http://chocosul.local`
- `http://mastter.local`

## 3) Hot reload sem restart de container

A atualizacao em codigo funciona sem restart porque:

- o codigo-fonte esta em bind mount (`.:/workspace`)
- os apps rodam com `tsx watch`
- `CHOKIDAR_USEPOLLING=true` para detectar mudancas em ambientes Docker/Windows

## 4) Deploy pelo Portainer (Stack)

### Opcao A: servidor com pasta local do projeto

1. Clone o repositorio no host Docker (exemplo Linux):

```bash
git clone <seu-repo> /opt/grupo-astoria-site
cp /opt/grupo-astoria-site/.env.docker.example /opt/grupo-astoria-site/.env
```

2. No Portainer: **Stacks > Add stack**.
3. Nome da stack: `grupo-astoria`.
4. Metodo: **Upload** ou **Web editor** usando o conteudo de `docker-compose.portainer.yml`.
5. Defina a variavel de ambiente da stack:
   - `PROJECT_PATH=/opt/grupo-astoria-site`
6. Deploy stack.

### Opcao B: Git repository no Portainer

1. Em **Stacks > Add stack > Repository**.
2. Informe repo e branch.
3. Compose path: `docker-compose.portainer.yml`.
4. Defina `PROJECT_PATH` para o caminho real no host (quando usar bind mount).
5. Deploy.

## 5) Nginx e dominios publicos

No DNS publico, configure:

- `admin-astoria.com.br` -> IP do servidor
- `chocosul.com.br` -> IP do servidor
- `mastter.com.br` -> IP do servidor

O arquivo `infra/nginx/default.conf` ja roteia por `server_name` para cada app.

## 6) HTTPS (recomendado)

Para TLS automatizado, use um proxy com ACME (Traefik/Caddy) ou Nginx + certbot.

## 7) Operacao diaria pelo Portainer

- Ver logs: **Containers > astoria-* > Logs**
- Rebuild apos mudar dependencias: **Stacks > grupo-astoria > Update the stack**
- Mudancas de codigo (bind mount): entram automaticamente sem restart
- Se o host usa Git: atualize codigo com `git pull` no host; watchers aplicam as mudancas

## 8) Observacoes

- O app `mastter` hoje usa o backend da base Chocosul em porta separada (`3003`).
- Se quiser identidade visual distinta por dominio, o proximo passo e resolver tema por `Host` no app Chocosul.

