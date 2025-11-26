# STAGE 1 — Build Angular App
FROM node:20 AS build
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the Angular project
COPY . .

# Build Angular (fixed: use npx @angular/cli to resolve ng binary)
RUN npx @angular/cli build --configuration production

# STAGE 2 — Serve with Nginx
FROM nginx:alpine

# Copy built assets (fixed: use exact dist path; replace 'chat-prototipo' if needed)
COPY --from=build /app/dist/ChatPrototipo /usr/share/nginx/html/

# Optional: Copy a custom nginx.conf if you need routing tweaks (e.g., for Angular's SPA fallback)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
