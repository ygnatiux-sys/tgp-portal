// @ts-ignore
import { env } from 'cloudflare:workers';
import config from '../../../../keystatic.config';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import type { APIContext } from 'astro';

export const prerender = false;

const _config = {
  config,
  clientId: (env as any).KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: (env as any).KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: (env as any).KEYSTATIC_SECRET,
};

const handler = makeGenericAPIRouteHandler(_config, {
  slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG',
});

export const all = async (context: APIContext) => {
  const { body, headers, status } = await handler(context.request);

  const responseHeaders = new Headers();

  if (headers) {
    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        responseHeaders.append(key, value);
      }
    } else if (typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
        if (Array.isArray(value)) {
          for (const v of value) responseHeaders.append(key, v);
        } else if (typeof value === 'string') {
          responseHeaders.append(key, value);
        }
      }
    }
  }

  return new Response(body as BodyInit, {
    status: status ?? 200,
    headers: responseHeaders,
  });
};

export const ALL = all;
