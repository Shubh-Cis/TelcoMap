# Multi-stage Dockerfile for NestJS Telecom Network Backend

# ------------------------------------------------------------------------------
# Stage 1: Build Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed by Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and configuration
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Compile TypeScript
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install system dependencies needed by Prisma runtime on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/
COPY docker-entrypoint.sh ./

# Install runtime dependencies including ts-node for database seeding
RUN npm install --omit=dev && \
    npx prisma generate && \
    chmod +x /app/docker-entrypoint.sh

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
