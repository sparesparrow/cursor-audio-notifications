FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    alsa-utils \
    wget \
    libfuse2 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Download Cursor AppImage
RUN wget https://download.cursor.sh/linux/appImage/x64/Cursor-latest.AppImage -O /usr/local/bin/cursor \
    && chmod +x /usr/local/bin/cursor

# Install VSCE globally
RUN npm install -g @vscode/vsce

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build extension
RUN npm run compile

# Package extension
RUN vsce package

# Set environment variables
ENV NODE_ENV=development
ENV CURSOR_EXECUTABLE=/usr/local/bin/cursor

# Command to run tests and create package
CMD ["sh", "-c", "npm test && vsce package"] 