import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

export const prerender = false;

export const ALL = async (context) => {
  // En Cloudflare Workers, los secretos (Environment Variables) se inyectan en context.locals.runtime.env
  // En desarrollo local (miniflare/vite), pueden estar en import.meta.env o process.env
  const env = context.locals?.runtime?.env || import.meta.env || process.env || {};

  const handler = makeHandler({
    config,
    clientId: env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: env.KEYSTATIC_SECRET,
  });

  return handler(context);
};
