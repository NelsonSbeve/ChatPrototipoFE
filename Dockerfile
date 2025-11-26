# STAGE 1 — Build Angular App
FROM node:20 AS build
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Force dev mode to include build tools (e.g., @angular/cli and @angular/build)
ENV NODE_ENV=development

# Install dependencies (now includes devDeps like @angular/cli v20.3.11)
RUN npm install

# Copy the rest of the Angular project
COPY . .

# Build Angular (use local CLI binary to match project version)
RUN ./node_modules/.bin/ng build --configuration production

# STAGE 2 — Serve with Nginx
FROM nginx:alpine

# Copy built assets (your exact dist path)
COPY --from=build /app/dist/ChatPrototipo /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
