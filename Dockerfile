# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
RUN npm config set registry https://registry.npmmirror.com
WORKDIR /build/h5
COPY h5/package.json h5/package-lock.json ./
RUN npm ci
COPY h5/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
RUN npm config set registry https://registry.npmmirror.com
WORKDIR /build/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy backend
COPY --from=backend-build /build/server/dist ./server/dist
COPY --from=backend-build /build/server/node_modules ./server/node_modules
COPY --from=backend-build /build/server/package.json ./server/

# Copy frontend to nginx serve dir
COPY --from=frontend-build /build/h5/dist ./public

# Ensure data directory exists for SQLite
RUN mkdir -p /app/server/data

# Copy nginx and supervisor config
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisord.conf

# Remove default nginx config
RUN rm -f /etc/nginx/http.d/default.conf.bak

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
