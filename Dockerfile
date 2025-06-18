# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application with build time environment variable
RUN VITE_BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z") npm run build

# Debug: Check if build succeeded
RUN echo "=== BUILD STAGE DEBUG ===" && \
    ls -la /app/ && \
    echo "=== DIST FOLDER CONTENT ===" && \
    ls -la /app/dist/ && \
    echo "=== DIST FILES ===" && \
    find /app/dist -type f && \
    echo "=== END BUILD DEBUG ==="

# Production stage
FROM nginx:alpine

# Debug: Show default nginx content before removal
RUN echo "=== NGINX DEFAULT CONTENT ===" && \
    ls -la /usr/share/nginx/html/

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Debug: Show copied content
RUN echo "=== COPIED CONTENT ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== INDEX.HTML CONTENT ===" && \
    cat /usr/share/nginx/html/index.html || echo "No index.html found!" && \
    echo "=== NGINX CONFIG ===" && \
    cat /etc/nginx/nginx.conf | head -20

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
