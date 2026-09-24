FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

USER node

EXPOSE 3000

CMD ["npm", "start"]
