FROM node:20-alpine

WORKDIR /app
COPY package.json ./
COPY server.mjs ./

ENV PORT=8080
ENV HC_UPSTREAM=https://humanitycommons.org
ENV HC_DATA_DIR=/data

VOLUME ["/data"]
EXPOSE 8080

CMD ["node", "server.mjs"]
