FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --legacy-peer-deps && npm cache clean --force

COPY . .

# Expose port 4200
EXPOSE 4200

# Start angular serve on all interfaces with docker proxy config
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--proxy-config", "proxy.docker.conf.json"]
