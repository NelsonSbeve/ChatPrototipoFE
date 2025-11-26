# Stage 1: Build Angular app
FROM node:20 AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

# Install dependencies and Angular CLI globally
RUN npm install -g @angular/cli
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the Angular app
RUN ng build --configuration production

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=build /app/dist/<ChatPrototipo> /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
