# STAGE 1 — Build Angular App
FROM node:20 AS build
WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the Angular project
COPY . .

# Build Angular
RUN npx ng build --configuration production

# STAGE 2 — Serve with Nginx
FROM nginx:alpine

# IMPORTANT: replace "chat-prototipo" with your actual project name from angular.json
COPY --from=build /app/dist/* /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
