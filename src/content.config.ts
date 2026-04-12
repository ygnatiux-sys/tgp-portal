import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const commonSchema = z.object({
  title: z.string(),
  hero_image: z.string().optional().default('/images/default-hero.jpg'),
  layout_style: z.enum(['cinematic-dark', 'cinematic-vintage', 'apple-os', 'magazine-luxury']).default('cinematic-dark'),
});

export const collections = {
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
};
