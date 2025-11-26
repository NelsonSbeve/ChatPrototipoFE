# Stage 1: Build the Angular app
FROM node:20-alpine AS build

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências primeiro (para cachear camadas)
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o resto do código fonte
COPY . .

# Construa o app para produção
RUN npm run build
# Alternativa se precisar explicitar: RUN npm run build -- --configuration production

# Stage 2: Serve com Nginx para produção
FROM nginx:alpine

# Copie os arquivos buildados da subpasta browser para o diretório do Nginx
COPY --from=build /app/dist/ChatPrototipo/browser /usr/share/nginx/html

# Copie uma configuração custom de Nginx se necessário (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exponha a porta 80 (HTTP padrão)
EXPOSE 80

# O CMD padrão do Nginx já inicia o server
 