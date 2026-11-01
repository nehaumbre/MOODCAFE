# Multi-stage Dockerfile optimized for Google Cloud Run
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code and build frontend & server bundles
COPY . .
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled bundles from builder stage
COPY --from=builder /app/dist ./dist

# Use non-root node user for container security
USER node

EXPOSE 8080

# Google Cloud Run expects container to listen on PORT
CMD ["node", "dist/server.js"]
