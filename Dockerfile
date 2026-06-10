FROM node:20-alpine

WORKDIR /workspace

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3001 3002 3003 3004

CMD ["npm", "run", "dev"]

