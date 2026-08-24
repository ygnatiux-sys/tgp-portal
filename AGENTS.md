# TGP Workspace Rules & Directives

## Regla de Despliegue y Git Obligatoria (Mandatory Deployment Template)
Siempre que el usuario solicite desplegar, publicar cambios o respaldar en GitHub, ofrecer inmediatamente esta plantilla de comandos:

### 1. Despliegue a Producción (Cloudflare Workers)
```powershell
npm run build; npx wrangler deploy
```

### 2. Respaldo Completo a GitHub (Git Push)
```powershell
git add . ; git commit -m "update: publicaciones y mejoras del portal" ; git push origin main
```

### 3. Flujo Todo-en-Uno (Build + Deploy + Git Push)
```powershell
npm run build; npx wrangler deploy; git add .; git commit -m "deploy: produccion y git actualizados"; git push origin main
```

## Arquitectura de Despliegue
- **Cloudflare Worker:** `https://tgp-ediciones.ygnatiux.workers.dev`
- **Configuración:** `wrangler.toml` con `assets = { directory = "./dist" }`
- **Sitemap & SEO:** `@astrojs/sitemap` activo con `https://thegreatpuzzleproject.com`
- **Keystatic Admin:** `http://127.0.0.1:4322/keystatic` (iniciado vía `npm run dev`)
