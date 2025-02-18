FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    alsa-utils \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build extension
RUN npm run compile

# Set environment variables
ENV NODE_ENV=development

# Command to run tests
CMD ["npm", "test"] 