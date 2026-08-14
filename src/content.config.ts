// Content Layer Configuration - Forced Refresh
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const templateSchema = z.object({
  title: z.string(),
  themeKey: z.string(),
  description: z.string().optional(),
});

const commonSchema = z.object({
  title: z.string().optional().default(''),
  template: z.string().optional().nullable(), // Relajado para admitir vacíos o null
  hero_image: z.string().optional().default('/images/default-hero.jpg'),
  layout_style: z.enum(['cinematic-dark', 'cinematic-vintage', 'apple-os', 'magazine-luxury']).default('cinematic-dark'),
  format_scale: z.enum(['max-w-2xl', 'max-w-4xl', 'w-full']).optional().default('max-w-4xl'),
  enable_stress_test: z.boolean().optional().default(false),
  editorial_spreads: z.array(z.object({
    discriminant: z.string(),
    value: z.object({
      spread_type: z.string(),
      images: z.array(z.string()),
      caption: z.string().optional(),
    }),
  })).optional(),
  date: z.coerce.string().optional().default(new Date().toISOString()),
});

const ensayosFeedSchema = z.object({
  title: z.string().optional().default('Sin título'),
  subtitle: z.string().optional().default('Continuará...'),
  template: z.string().optional().nullable(), // Relajado para admitir vacíos o null
  coverImage: z.string().optional().default('/images/default-hero.jpg'),
  author: z.string().default('Xavier Benítez'),
  accentColor: z.string().default('#1a1a1a'),
  date: z.coerce.string().optional().default(new Date().toISOString()),
});

const capsulaSchema = z.object({
  title: z.string().optional().default(''),
  template: z.string().optional().nullable(), // Relajado para admitir vacíos o null
  hero_image: z.string().optional().default('/images/default-hero.jpg'),
  master_archetype: z.enum(['tactile-archive', 'expansive-gallery', 'kinetic-manifesto', 'field-notebook']).default('tactile-archive'),
  editorial_spreads: z.array(z.object({
    discriminant: z.string(),
    value: z.object({
      spread_type: z.string(),
      images: z.array(z.string()),
      caption: z.string().optional(),
    }),
  })).optional(),
  date: z.coerce.string().optional().default(new Date().toISOString()),
});

export const collections = {
  'editorialTemplates': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc,json,yaml}", base: "./src/content/editorial_templates" }),
    schema: templateSchema
  }),
  'essays': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/essays" }),
    schema: commonSchema
  }),
  'architectures': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/architectures" }),
    schema: commonSchema
  }),
  'visual_signals': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/visual_signals" }),
    schema: commonSchema
  }),
  'capsulas': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/capsulas" }),
    schema: capsulaSchema
  }),
  'ensayos': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/ensayos" }),
    schema: ensayosFeedSchema
  }),
};
