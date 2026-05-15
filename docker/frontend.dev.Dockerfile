# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /app

# Pre-copy lockfile-able metadata for cache efficiency
COPY package.json ./

EXPOSE 5173
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
