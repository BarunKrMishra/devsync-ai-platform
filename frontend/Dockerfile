FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/.next ./.next
# Create public directory and copy if it exists
RUN mkdir -p ./public
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
