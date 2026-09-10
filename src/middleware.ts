import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  // Hack to inject Cloudflare secrets into context.locals.runtime.env for @keystatic/astro compatibility in Prod
  if (import.meta.env.PROD) {
    try {
      // @ts-ignore
      const cf = await import('cloudflare:workers');
      // @ts-ignore
      if (!context.locals.runtime) {
        // @ts-ignore
        context.locals.runtime = {};
      }
      // Override the throwing getter created by Astro 6/7
      // @ts-ignore
      Object.defineProperty(context.locals.runtime, 'env', {
        get() {
          return cf.env;
        },
        configurable: true
      });
    } catch (e) {
      // Ignore if not on Cloudflare
    }
  }

  return next();
};
