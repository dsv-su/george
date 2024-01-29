FROM debian:trixie

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY vite.config.ts vite.config.ts
COPY src/ src/
COPY index.html index.html
COPY tsconfig.json tsconfig.json
COPY tsconfig.node.json tsconfig.node.json
RUN npm install

EXPOSE 5173

CMD exec npm run docker
