# Menggunakan base image Node.js versi 16
FROM node:18

# Menentukan versi Chromium yang diinginkan (optional)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV TZ=Asia/Jakarta

# Install dependencies yang dibutuhkan untuk Puppeteer dan Chromium
RUN apt-get update && apt-get install -y \
  apt-transport-https \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libgbm1 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libxext6 \
  libxfixes3 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils \
  fonts-noto-color-emoji \
  --no-install-recommends \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Install Chromium secara manual
RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime; \
  echo ${TZ} > /etc/timezone \

# Set environment variable untuk skip download default Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Build project
RUN npm run build

# Jalankan aplikasi
CMD ["npm", "start"]
