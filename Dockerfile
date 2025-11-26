# ================================
# Stage 1: Build (usa imagem full do Node, não Alpine)
# ================================
FROM node:20 AS build

WORKDIR /app

# Copia package.json e lock
COPY package*.json ./
RUN npm ci --quiet

# Force dev mode to include build tools (e.g., @angular/cli and @angular/build)
ENV NODE_ENV=development

# Install dependencies (now includes devDeps like @angular/cli v20.3.11)
RUN npm install

# Copy the rest of the Angular project
COPY . .

# Build Angular (use local CLI binary to match project version)
RUN ./node_modules/.bin/ng build --configuration production

# ================================
# Stage 2: Serve com Nginx leve
# ================================
FROM nginx:alpine

# Copia os arquivos buildados (ajusta o nome do projeto se necessário)
COPY --from=build /app/dist/chat-prototipo/browser /usr/share/nginx/html

# Opcional: config para SPA (refresh de rotas)

EXPOSE 80
