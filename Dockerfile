# Step 1: Build the application
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the application using Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure Nginx to listen on port 8080 for Cloud Run
RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
