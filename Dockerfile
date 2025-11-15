# Multi-stage Dockerfile for React + Vite Frontend
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with exact versions from package-lock.json
RUN npm ci --prefer-offline --no-audit

# Copy application source code
COPY . .

# Build the application for production
# This runs: tsc -b && vite build
RUN npm run build

# Stage 2: Production environment with nginx
FROM nginx:1.26-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx configuration
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx cache directory
RUN mkdir -p /var/cache/nginx/client_temp && \
    chown -R nginx:nginx /var/cache/nginx

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check to ensure nginx is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
