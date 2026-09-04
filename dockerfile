FROM nginx:alpine

# Copy your custom port 8080 configuration into Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy all your JSON data files into the web folder
COPY . /usr/share/nginx/html/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
