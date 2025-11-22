# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files to install dependencies first (caching layer)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application (creates the 'dist' folder)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:stable-alpine

# Copy the build output from Stage 1 to Nginx's html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Basic healthcheck to ensure Nginx responds
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
