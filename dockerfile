# Use a lightweight Nginx web server
FROM nginx:alpine

# Copy all your repository files (including your JSON data) into Nginx's web folder
COPY . /usr/share/nginx/html/

# Expose port 8080 for Google Cloud Run
EXPOSE 8080

# Configure Nginx to run on port 8080 instead of the default port 80
CMD ["nginx", "-g", "daemon off;", "-c", "/etc/nginx/nginx.conf"]
