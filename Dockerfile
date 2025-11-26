# ================================
# Stage 1: Build do Angular
# ================================
FROM node:20-alpine AS build

WORKDIR /app

# Copia package.json e lock
COPY package*.json ./

# Instala dependências (inclui @angular/cli)
RUN npm ci

# Copia o código todo
COPY . .

# ←←← A LINHA MÁGICA QUE RESOLVE TUDO ←←←
# Usa diretamente o binário do Angular CLI que está em node_modules
RUN ./node_modules/.bin/ng build --configuration production
# ou equivalente (mais curto):
# RUN npx ng build --configuration production

# ================================
# Stage 2: Nginx
# ================================
FROM nginx:alpine

# Copia apenas a pasta browser (Angular 20 gera assim)
COPY --from=build /app/dist/chat-prototipo/browser /usr/share/nginx/html

EXPOSE 80
