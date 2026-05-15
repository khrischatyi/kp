# syntax=docker/dockerfile:1.7
# ------------------------------------------------------------------- builder #
FROM node:20-alpine AS builder

ARG VITE_API_BASE_URL
ARG VITE_PHOTOS_BASE_URL
ARG VITE_SITE_NAME
ARG VITE_SITE_DESCRIPTION

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_PHOTOS_BASE_URL=${VITE_PHOTOS_BASE_URL} \
    VITE_SITE_NAME=${VITE_SITE_NAME} \
    VITE_SITE_DESCRIPTION=${VITE_SITE_DESCRIPTION}

WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# ------------------------------------------------------------------ runtime #
FROM alpine:3.19 AS runtime
WORKDIR /dist
COPY --from=builder /app/dist/ /dist/
# The static files are exposed to Caddy via a shared docker volume.
VOLUME ["/usr/share/nginx/html"]
CMD ["sh", "-c", "cp -r /dist/* /usr/share/nginx/html/ && tail -f /dev/null"]
