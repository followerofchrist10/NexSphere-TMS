FROM node:22-alpine

WORKDIR /app

# Copy dependency manifests and npm configuration
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Build frontend assets to dist/
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start production full-stack server
CMD ["npm", "start"]
