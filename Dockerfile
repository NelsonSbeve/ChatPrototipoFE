# ================================
# Stage 1: Build
# ================================
FROM node:22.14 AS build

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Clean npm cache to avoid corruption
RUN npm cache clean --force

# Ensure devDeps install (e.g., @angular/cli, @angular/build)
ENV NODE_ENV=development

# Install dependencies (robust: frozen-lockfile mimics ci, flags reduce flakiness)
RUN npm install --frozen-lockfile --no-audit --no-fund --progress=false --loglevel=error

# Copy source code
COPY . .

# Build Angular (explicit prod config for optimized deploy)
RUN ./node_modules/.bin/ng build --configuration production

# ================================
# Stage 2: Serve with Nginx
# ================================
FROM nginx:alpine

# Copy built assets (your fixed path for Angular 20 app builder)
COPY --from=build /app/dist/ChatPrototipo/browser /usr/share/nginx/html

# Config for SPA routing (handles client-side routes)
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
