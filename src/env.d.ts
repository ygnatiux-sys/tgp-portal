/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_TGP_PROXY_URL: string;
  readonly PUBLIC_TGP_PICKER_URL: string;
  readonly PUBLIC_TGP_VEO_API_URL: string;
  readonly PUBLIC_TGP_MIND_URL: string;
  readonly PUBLIC_TGP_APP_URL: string;
  readonly TGP_MIND_TOKEN: string;
  // Añade aquí más variables públicas si es necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
