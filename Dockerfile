# ================================
# Stage 1: Build do Angular
# ================================
FROM node:20-alpine AS build

# Define diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (melhor cache)
COPY package*.json ./

# Instala tudo (inclui o @angular/cli que já tens em devDependencies)
RUN npm ci

# Copia o resto do código
COPY . .

# Executa o build de produção
# Usa o Angular CLI que está em node_modules → nunca dá "ng: not found"
RUN npm run build -- --configuration production
# ou simplesmente: RUN npm run build   (se mudares o script no package.json)

# ================================
# Stage 2: Servir com Nginx (produção)
# ================================
FROM nginx:alpine

# Copia os arquivos buildados da subpasta browser (Angular 17+ / 20)
COPY --from=build /app/dist/chat-prototipo/browser /usr/share/nginx/html

# (Opcional) Configuração custom do Nginx para SPAs (fallback para index.html)
# Descomenta as 2 linhas abaixo se tiveres problemas com refresh de rotas
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# (cria um nginx.conf com "try_files $uri $uri/ /index.html;" se precisares)

# Porta padrão
EXPOSE 80

# Nginx já inicia automaticamente
