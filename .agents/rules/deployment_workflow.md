# 🚀 TGP Deployment & Git Workflow Rules

Guía de comandos estandarizados para publicación, respaldos en Git y despliegues en Cloudflare Workers y Pages.

---

## ⚡ Comandos Rápidos de Despliegue y Git

### 1️⃣ Despliegue a Cloudflare Workers (Sitio en Vivo)
Compila los 59+ artículos y sitemaps, y los sube a la red global de Cloudflare Workers:
```powershell
npm run build; npx wrangler deploy
```

---

### 2️⃣ Respaldo Completo en GitHub (Git Push)
Registra todos los cambios, contenido de Keystatic y código en `main`:
```powershell
git add . ; git commit -m "feat: actualizacion de contenido y despliegue" ; git push origin main
```

---

### 3️⃣ Comando Todo-en-Uno (Build + Deploy + Git Push)
Para compilar, desplegar en Cloudflare y respaldar en GitHub en una sola línea:
```powershell
npm run build; npx wrangler deploy; git add .; git commit -m "deploy: produccion actualizada"; git push origin main
```

---

### 4️⃣ Desarrollo Local y Keystatic
Para redactar artículos y previsualizar cambios en vivo:
```powershell
npm run dev
```
- **Panel Keystatic:** `http://127.0.0.1:4322/keystatic` (o `:4321`)
- **Portal Local:** `http://127.0.0.1:4322/`

---

## 🌐 URLs del Proyecto
- **Workers Live URL:** `https://tgp-ediciones.ygnatiux.workers.dev`
- **Pages Live URL:** `https://tgp-portal.pages.dev`
- **Sitemap Principal:** `https://thegreatpuzzleproject.com/sitemap-index.xml`
- **Robots:** `https://thegreatpuzzleproject.com/robots.txt`
