
# 🖼️ Image Processing API

API backend para upload e processamento assíncrono de imagens, desenvolvida como solução para o desafio técnico da Trakto. A aplicação enfileira imagens para processamento, gera múltiplas versões otimizadas e expõe uma API para consulta dos resultados.

---

## ✨ Funcionalidades

- Upload de imagem via `multipart/form-data`
- Geração de versões otimizadas: baixa (320px), média (800px) e alta qualidade (original otimizada)
- Processamento assíncrono com RabbitMQ
- Armazenamento de metadados e versões no MongoDB e disco
- Consulta do status da tarefa e recuperação das imagens
- Mecanismo de retry com controle de tentativas
- Separação clara entre domínio, aplicação e infraestrutura

---

## 🛠️ Tecnologias Utilizadas

- Node.js (v22.15.0) + TypeScript
- Express
- MongoDB
- RabbitMQ
- Sharp (processamento de imagem)
- Docker e Docker Compose
- Jest (testes)
- Pino (logging estruturado)

---

## 🐳 Docker

### Dockerfiles

- `docker/server.Dockerfile`: build do servidor Express
- `docker/worker.Dockerfile`: build do worker de processamento

### docker-compose.yml

Sobe:
- MongoDB (porta 27017)
- RabbitMQ (portas 5672 e 15672)
- Aplicação backend (`app`)
- Worker (`worker`)

---

## ▶️ Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run start` | Inicia a API a partir dos arquivos compilados |
| `npm run dev` | Inicia a API com `nodemon` para desenvolvimento |
| `npm run build` | Compila o projeto TypeScript para JavaScript (em `dist/`) |
| `npm run test` | Executa os testes com Jest |
| `npm run worker:process-image:dev` | Roda o worker diretamente com `ts-node` |
| `npm run worker:process-image:prod` | Roda o worker já compilado (produção) |

---

## 🔧 Variáveis de Ambiente `.env`

```env
MONGO_URI="mongodb://localhost:27017/trakto"
RABBITMQ_URI="amqp://admin:admin@localhost:5672"
RABBITMQ_QUEUE="images.process"
RABBITMQ_EXCHANGE="images"
RABBITMQ_RETRIES_TRESHOLD=5
NODE_ENV=development
```

---

## 🚀 Como rodar o projeto com Docker

### 1. Build dos containers

```bash
docker compose build
```

### 2. Subir os serviços

```bash
docker compose up
```

### 3. Acesso

- API: `http://localhost:3000`
- RabbitMQ Management UI: `http://localhost:15672`
  - **Usuário:** `admin`
  - **Senha:** `admin`

---

## 📬 Endpoints

### POST `/upload`

Faz o upload de uma imagem.

**Requisição:**
- Método: `POST`
- Tipo: `multipart/form-data`
- Campo: `file`

**Resposta:**

```json
{
  "taskId": "126b43f0-c75f-4a4c-a959-14a03514e216",
  "status": "PENDING"
}
```

---

### GET `/status/:taskId`

Consulta o status de processamento de uma imagem.

**Resposta (exemplo):**

```json
{
  "taskId": "126b43f0-c75f-4a4c-a959-14a03514e216",
  "status": "COMPLETED",
  "original": {
    "width": 1920,
    "height": 1080
  },
  "versions": {
    "low": {
      "width": 320,
      "sizeBytes": 12435
    },
    "medium": {
      "width": 800,
      "sizeBytes": 45678
    },
    "high_optimized": {
      "width": 1920,
      "sizeBytes": 78901
    }
  }
}
```

---

## ✅ Funcionalidades Implementadas

- [x] Upload de imagem com retorno imediato (`taskId`)
- [x] Processamento assíncrono com RabbitMQ
- [x] Geração de 3 versões otimizadas com `sharp`
- [x] Armazenamento de metadados em MongoDB
- [x] Registro de status, dimensões e tamanho
- [x] Worker resiliente com mecanismo de retry
- [x] Consulta de status com endpoint GET
- [x] Docker/Docker Compose para facilitar execução
- [x] Teste automatizado para fluxo de upload

---

## 📌 Melhorias Futuras

- [ ] Adicionar documentação interativa com Swagger
- [ ] Dead Letter Queue para mensagens com falha definitiva
- [ ] Mais testes unitários e de integração

---

## 📥 Exemplos com `curl`

### Upload de imagem

```bash
curl -X POST http://localhost:3000/upload   -F "file=@/caminho/para/sua/imagem.jpg"
```

**Resposta esperada:**
```json
{
  "taskId": "uuid-v4",
  "status": "PENDING"
}
```

---

### Consultar status da imagem

```bash
curl http://localhost:3000/status/126b43f0-c75f-4a4c-a959-14a03514e216
```
