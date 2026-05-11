# 🐳 Docker - Chocosul Site

Este documento descreve como executar o projeto Chocosul em um container Docker.

## 📋 Pré-requisitos

- Docker instalado ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (geralmente vem com Docker Desktop)

## 🚀 Opções de Execução

### Opção 1: Usando Docker Compose (Recomendado)

A forma mais simples de executar o projeto:

```bash
cd Chocosul
docker-compose up -d
```

A aplicação estará disponível em: **http://localhost:8080**

Para parar a aplicação:
```bash
docker-compose down
```

---

### Opção 2: Usando Docker CLI

#### Build da imagem

```bash
cd Chocosul
docker build -t chocosul-site .
```

#### Executar o container

```bash
docker run -d -p 8080:80 --name chocosul-site chocosul-site
```

A aplicação estará disponível em: **http://localhost:8080**

#### Parar o container

```bash
docker stop chocosul-site
docker rm chocosul-site
```

---

## 📊 Monitoramento e Logs

### Ver logs em tempo real
```bash
docker-compose logs -f chocosul
```

### Ver informações do container
```bash
docker-compose ps
```

---

## 🔧 Customização

### Alterar a porta de acesso

Edite o arquivo `docker-compose.yml` e mude a porta:

```yaml
ports:
  - "3000:80"  # Acesso em http://localhost:3000
```

### Ajustar recursos (CPU/Memória)

Edite o `docker-compose.yml`:

```yaml
services:
  chocosul:
    # ... configurações anteriores ...
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

---

## 📦 Estrutura da Imagem

A imagem Docker utiliza:
- **Base**: `nginx:alpine` (leve e otimizado)
- **Tamanho estimado**: ~20-40 MB
- **Servidor**: Nginx (production-ready)

---

## 🛠️ Troubleshooting

### A porta está em uso

Se a porta 8080 está ocupada, escolha outro número:

```bash
docker run -d -p 3000:80 --name chocosul-site chocosul-site
```

### Container falha ao iniciar

Verifique os logs:
```bash
docker logs chocosul-site
```

### Limpar imagens e containers não usados

```bash
docker system prune -a
```

---

## 📝 Notas

- Os arquivos estáticos são servidos com cache de 1 ano para melhor performance
- O servidor Nginx está configurado para servir o `index.html` como fallback
- A saúde do container é verificado automaticamente a cada 30 segundos
- O container reinicia automaticamente em caso de falha (exceto parada manual)

---

## 📞 Suporte

Para mais informações sobre Docker, visite: [Docker Documentation](https://docs.docker.com/)

