import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonSchema = z.object({
  title: z.string(),
  hero_image: z.string().optional().default('/images/default-hero.jpg'),
  layout_style: z.enum(['cinematic-dark', 'cinematic-vintage', 'apple-os', 'magazine-luxury']).default('cinematic-dark'),
  format_scale: z.enum(['max-w-2xl', 'max-w-4xl', 'w-full']).optional().default('max-w-4xl'),
  enable_stress_test: z.boolean().optional().default(false),
  editorial_vibe: z.object({
    discriminant: z.enum(['standard', 'vogue-luxury']),
    value: z.string().optional(),
  }).optional(),
  editorial_spreads: z.array(z.object({
    discriminant: z.string(),
    value: z.object({
      spread_type: z.string(),
      images: z.array(z.string()),
      caption: z.string().optional(),
    }),
  })).optional(),
});

const capsulaSchema = z.object({
  title: z.string(),
  hero_image: z.string().optional().default('/images/default-hero.jpg'),
  master_archetype: z.enum(['tactile-archive', 'expansive-gallery', 'kinetic-manifesto', 'field-notebook']),
  editorial_spreads: z.array(z.object({
    discriminant: z.string(),
    value: z.object({
      spread_type: z.string(),
      images: z.array(z.string()),
      caption: z.string().optional(),
    }),
  })).optional(),
});

const essaySchema = commonSchema;

export const collections = {
  'essays': defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx,mdoc}", base: "./src/content/essays" }),
    schema: essaySchema
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
};
