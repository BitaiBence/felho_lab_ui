# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Angular application
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:alpine

# Copy nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CHANGED: Add /ui to the destination path!
COPY --from=builder /app/dist/photo-ui/browser /usr/share/nginx/html/ui

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

