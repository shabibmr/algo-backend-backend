FROM node:20-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["sh", "-c", "npx prisma generate && npm run dev"]
