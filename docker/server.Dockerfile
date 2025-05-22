FROM node:22.15.0 AS builder

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Etapa de produção
FROM node:22.15.0 AS production

WORKDIR /home/node/app

# Copiar apenas o build e dependências
COPY --from=builder /home/node/app/package*.json ./
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/dist ./dist

RUN mkdir dist/storage

# Porta padrão
EXPOSE 3000

# Iniciar o app
CMD ["npm", "run", "start"]
