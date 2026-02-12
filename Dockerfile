# FFmpeg Playground Server
# Production-ready Docker image for Render deployment

FROM node:20-alpine

# Install FFmpeg, curl for healthcheck, and build dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories for temp files and outputs
RUN mkdir -p /app/temp /app/outputs /app/uploads

# Set environment variables
ENV NODE_ENV=production

# Expose port (Render sets PORT dynamically)
EXPOSE 3001

# Health check using curl instead of wget
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

# Start server
CMD ["node", "server.js"]
