# ================================
# Stage 1: Build
# ================================
FROM node:22.14 AS build

WORKDIR /app

# Instala Angular CLI globalmente
RUN npm install -g @angular/cli@20

# Copia package files
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia código
COPY . .

# Build (sem --configuration production para testar)
RUN ng build

# ================================
# Stage 2: Serve com Nginx
# ================================
FROM nginx:alpine

# Copia os arquivos buildados
COPY --from=build /app/dist/ChatPrototipo/browser /usr/share/nginx/html

# Config para SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
