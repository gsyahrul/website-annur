FROM node:18-alpine

WORKDIR /app

# Copy everything including node_modules from host
COPY . .

RUN mkdir -p /app/uploads

EXPOSE 5000

CMD ["node", "index.js"]
