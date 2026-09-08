import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Hack to inject Cloudflare secrets into context.locals.runtime.env for @keystatic/astro compatibility in Prod
  if (import.meta.env.PROD) {
    try {
      const cf = await import('cloudflare:workers');
      if (!context.locals.runtime) {
        // @ts-ignore
        context.locals.runtime = {};
      }
      // @ts-ignore
      context.locals.runtime.env = cf.env;
    } catch (e) {
      // Ignore if not on Cloudflare
    }
  }

  return next();
};
