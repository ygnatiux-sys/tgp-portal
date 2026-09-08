// @ts-ignore
import { env } from 'cloudflare:workers';
import config from '../../../../keystatic.config';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
// @ts-ignore
import { parseString } from 'set-cookie-parser';
import type { APIContext } from 'astro';

export const prerender = false;

const _config = {
  config,
  clientId: (env as any).KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: (env as any).KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: (env as any).KEYSTATIC_SECRET,
};

const handler = makeGenericAPIRouteHandler(_config, {
  slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG'
});

export const all = async (context: APIContext) => {
  const { body, headers, status } = await handler(context.request);
  
  let headersInADifferentStructure = new Map();
  if (headers) {
    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        headersInADifferentStructure.set(key.toLowerCase(), value);
      }
    } else if (headers instanceof Headers) {
      for (const [key, value] of headers.entries()) {
        headersInADifferentStructure.set(key.toLowerCase(), value);
      }
    } else {
      for (const [key, value] of Object.entries(headers)) {
        headersInADifferentStructure.set(key.toLowerCase(), value);
      }
    }
  }
  
  let parsedSetCookie = headersInADifferentStructure.has('set-cookie') 
    ? parseString(headersInADifferentStructure.get('set-cookie')) 
    : [];
    
  if (parsedSetCookie.length) {
    headersInADifferentStructure.delete('set-cookie');
  }
  
  const response = new Response(body as BodyInit, {
    status,
    headers: [...headersInADifferentStructure.entries()] as HeadersInit
  });
  
  for (const cookie of parsedSetCookie) {
    context.cookies.set(cookie.name, cookie.value, {
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      path: cookie.path,
      sameSite: cookie.sameSite as any,
      secure: cookie.secure
    });
  }
  
  return response;
};

export const ALL = all;
