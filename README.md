# nginx-proxy-manager CSR Generator

A custom extension of [nginx-proxy-manager](https://github.com/NginxProxyManager/nginx-proxy-manager) (v2.14.0) that adds a **CSR (Certificate Signing Request) Generator** to the web UI.

## What it adds

- **CSR Generator** menu item in the top navigation (visible to users with Certificates permission)
- A full-page form to fill in certificate details: Common Name, Organization, Org Unit, City, State, Country, Email
- Choose between **RSA** (2048/4096-bit) or **ECDSA** (prime256v1) keys
- Generated **CSR** and **Private Key** displayed with one-click copy and download buttons
- Backend endpoint `POST /api/nginx/csr` powered by OpenSSL (already bundled in the NPM image)

## How it works

A two-stage Docker build:
1. **Stage 1** — uses `node:20-alpine` to compile the modified React frontend
2. **Stage 2** — starts from the official `jc21/nginx-proxy-manager:2.14.0` image and overlays the new backend route + compiled frontend

## Usage

```bash
git clone https://github.com/uchuconbini/nginx-proxy-manager-csr.git
cd nginx-proxy-manager-csr

# Adjust docker-compose.yml build context paths if needed, then:
docker compose build
docker compose up -d
```

Access the UI at `http://<your-ip>:81` and log in. The **CSR Generator** link appears in the top navigation bar.

## Files changed from upstream

| File | Change |
|------|--------|
| `backend/routes/nginx/csr.js` | New — CSR generation endpoint using OpenSSL |
| `backend/routes/main.js` | Modified — registers the `/api/nginx/csr` route |
| `frontend/src/api/backend/generateCSR.ts` | New — TypeScript API helper |
| `frontend/src/api/backend/index.ts` | Modified — exports `generateCSR` |
| `frontend/src/pages/CSR/index.tsx` | New — CSR Generator page component |
| `frontend/src/components/SiteMenu.tsx` | Modified — adds CSR Generator nav item |
| `frontend/src/Router.tsx` | Modified — adds `/csr` route |
| `frontend/src/locale/src/en.json` | Modified — adds English locale strings |
| `Dockerfile` | New — multi-stage custom build |
| `docker-compose.yml` | Modified — uses local build instead of upstream image |
