// @ts-ignore: cloudflare:workers is available at runtime
import { env } from 'cloudflare:workers';
import { makeHandler } from '@keystatic/astro/api';
import config from '../../../../keystatic.config';

export const prerender = false;

export const all = makeHandler({
  config,
  clientId: (env as any).KEYSTATIC_GITHUB_CLIENT_ID,
  clientSecret: (env as any).KEYSTATIC_GITHUB_CLIENT_SECRET,
  secret: (env as any).KEYSTATIC_SECRET,
});

export const ALL = all;
