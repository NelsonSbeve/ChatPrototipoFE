# Stage 1: Build Angular app
FROM node:20 AS angular-build
WORKDIR /app
COPY ./ChatPrototipo.UI/package*.json ./
RUN npm install
COPY ./ChatPrototipo.UI/ ./
RUN npm run build -- --configuration production

# Stage 2: Serve Angular app via Nginx
FROM nginx:alpine
COPY --from=angular-build /app/dist/chat-prototipo /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
