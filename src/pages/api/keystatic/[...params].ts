import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import { parseString } from 'set-cookie-parser';
import config from '../../../../keystatic.config';
import type { APIContext } from 'astro';

export const prerender = false;

export const ALL = async (context: APIContext) => {
  // En Cloudflare Workers (Astro 6 / 7), los secretos se leen de 'cloudflare:workers'
  let cfEnv: Record<string, string> = {};
  try {
    // @ts-ignore: cloudflare:workers runtime module
    const { env } = await import('cloudflare:workers');
    cfEnv = env as unknown as Record<string, string>;
  } catch {
    cfEnv = (import.meta.env ?? {}) as Record<string, string>;
  }

  const clientId = cfEnv.KEYSTATIC_GITHUB_CLIENT_ID || import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID;
  const clientSecret = cfEnv.KEYSTATIC_GITHUB_CLIENT_SECRET || import.meta.env.KEYSTATIC_GITHUB_CLIENT_SECRET;
  const secret = cfEnv.KEYSTATIC_SECRET || import.meta.env.KEYSTATIC_SECRET;

  const handler = makeGenericAPIRouteHandler(
    {
      ...config,
      clientId,
      clientSecret,
      secret,
    },
    {
      slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG',
    }
  );

  const { body, headers, status } = await handler(context.request);

  let headersInADifferentStructure = new Map<string, string[]>();
  if (headers) {
    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        if (!headersInADifferentStructure.has(key.toLowerCase())) {
          headersInADifferentStructure.set(key.toLowerCase(), []);
        }
        headersInADifferentStructure.get(key.toLowerCase())!.push(value);
      }
    } else if (typeof (headers as any).entries === 'function') {
      for (const [key, value] of (headers as any).entries()) {
        headersInADifferentStructure.set(key.toLowerCase(), [value]);
      }
      if ('getSetCookie' in headers && typeof (headers as any).getSetCookie === 'function') {
        const setCookieHeaders = (headers as any).getSetCookie();
        if (setCookieHeaders !== null && setCookieHeaders !== void 0 && setCookieHeaders.length) {
          headersInADifferentStructure.set('set-cookie', setCookieHeaders);
        }
      }
    } else {
      for (const [key, value] of Object.entries(headers)) {
        headersInADifferentStructure.set(key.toLowerCase(), [value as string]);
      }
    }
  }

  const setCookieHeaders = headersInADifferentStructure.get('set-cookie');
  headersInADifferentStructure.delete('set-cookie');
  if (setCookieHeaders) {
    for (const setCookieValue of setCookieHeaders) {
      const { name, value, ...options } = parseString(setCookieValue);
      const sameSite = options.sameSite?.toLowerCase();
      context.cookies.set(name, value, {
        domain: options.domain,
        expires: options.expires,
        httpOnly: options.httpOnly,
        maxAge: options.maxAge,
        path: options.path,
        sameSite: sameSite === 'lax' || sameSite === 'strict' || sameSite === 'none' ? sameSite : undefined,
      });
    }
  }

  return new Response(body, {
    status,
    headers: [...headersInADifferentStructure.entries()].flatMap(([key, val]) => val.map((x) => [key, x])),
  });
};
