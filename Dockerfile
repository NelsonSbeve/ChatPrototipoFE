# Stage 1: Build Angular app
FROM node:20 AS build
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (local + CLI)
RUN npm install

# Copy rest of the project files
COPY . .

# Build Angular app
RUN npx ng build --configuration production

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=build /app/dist/<ChatPrototipo> /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
