# project_name/backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the backend source
COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]
