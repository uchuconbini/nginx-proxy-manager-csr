# Stage 1: Build the frontend with CSR generator feature
FROM node:20-alpine AS frontend-builder

WORKDIR /src

# Copy package files first for better layer caching
COPY npm-source/frontend/package.json npm-source/frontend/yarn.lock ./

RUN yarn install --frozen-lockfile --network-timeout 300000

# Copy full frontend source (including our CSR changes)
COPY npm-source/frontend ./

# Compile locales then build
RUN yarn locale-compile && yarn build

# Stage 2: Start from the official nginx-proxy-manager image
# and overlay our custom backend route + rebuilt frontend
FROM jc21/nginx-proxy-manager:2.14.0

# Copy custom backend routes
COPY npm-source/backend/routes/nginx/csr.js /app/routes/nginx/csr.js
COPY npm-source/backend/routes/nginx/ssl-checker.js /app/routes/nginx/ssl-checker.js

# Copy the modified main.js (registers all custom routes)
COPY npm-source/backend/routes/main.js /app/routes/main.js

# Replace the frontend with the newly compiled version that includes the CSR page
COPY --from=frontend-builder /src/dist /app/frontend
