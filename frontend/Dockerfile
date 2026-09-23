# Multi-stage Dockerfile for React/Vite Telecom Network Frontend

# ------------------------------------------------------------------------------
# Stage 1: Build Static Assets
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build config
COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY public ./public
COPY src ./src

# Build production bundle
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Nginx Server
# ------------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
