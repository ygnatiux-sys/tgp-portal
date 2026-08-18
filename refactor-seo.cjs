const fs = require('fs');

const layoutPath = 'c:/Users/ygnat/tgp-hemeroteca/src/layouts/Layout.astro';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

// 1. Añade `description?: string;` a la `interface Props`.
layoutContent = layoutContent.replace(
  /interface Props \{/,
  'interface Props {\n  description?: string;'
);

// 2. Añade `description = "...",` a la desestructuración de `Astro.props`.
layoutContent = layoutContent.replace(
  /const \{\n  title = "Hemeroteca TGP",/,
  'const {\n  title = "Hemeroteca TGP",\n  description = "The Great Puzzle Project - Plataforma de investigación independiente, cartografía epistémica y archivo sobre cultura visual y memoria histórica.",'
);

// 3. Justo antes del cierre del frontmatter (---), inyecta el objeto globalSchema
const globalSchemaCode = `
const globalSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "The Great Puzzle Project",
  "url": Astro.site ? new URL(Astro.url.pathname, Astro.site) : Astro.url.href,
  "author": {
    "@type": "Person",
    "name": "Xavier Benítez",
    "url": "https://gravatar.com/xavierbeniteztgp",
    "jobTitle": "Investigador & Editor General"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The Great Puzzle Project",
    "logo": {
      "@type": "ImageObject",
      "url": Astro.site ? new URL("/favicon.png", Astro.site).href : "/favicon.png"
    }
  }
};
---`;

layoutContent = layoutContent.replace(
  /---(?![\s\S]*---)/, // Last occurrence of ---
  globalSchemaCode
);

// En el HTML (<head>): Inyecta líneas debajo del <title>
const headTags = `
    <meta name="description" content={description} />
    <meta name="author" content="Xavier Benítez" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="The Great Puzzle Project" />
    <script type="application/ld+json" set:html={JSON.stringify(globalSchema)} />
    <slot name="head" />`;

layoutContent = layoutContent.replace(
  /<title>\{title\}<\/title>/,
  `<title>{title}</title>${headTags}`
);

fs.writeFileSync(layoutPath, layoutContent, 'utf8');
console.log('Layout.astro updated.');

// ==========================================

const slugPath = 'c:/Users/ygnat/tgp-hemeroteca/src/pages/hemeroteca/[slug].astro';
let slugContent = fs.readFileSync(slugPath, 'utf8');

const articleSchemaCode = `
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": entry.title,
  "abstract": entry.excerpt || entry.description,
  "author": {
    "@type": "Person",
    "name": "Xavier Benítez"
  },
  "publisher": {
    "@type": "Organization",
    "name": "The Great Puzzle Project"
  },
  "datePublished": entry.date,
  "dateModified": entry.updatedDate || entry.date,
  "keywords": [
    entry.category,
    entry.sitioGeohistorico,
    ...(entry.tags || [])
  ].filter(Boolean).join(", ")
};
---`;

slugContent = slugContent.replace(
  /---(?![\s\S]*---)/, // Last occurrence of ---
  articleSchemaCode
);

// En el HTML (Componente <Layout>):
slugContent = slugContent.replace(
  /<Layout title=\{`\$\{entry\.title\} \| The Great Puzzle Project`\}>/,
  `<Layout title={\`\${entry.title} | Hemeroteca TGP\`} description={entry.excerpt || entry.description}>
  <Fragment slot="head">
    <meta property="og:type" content="article" />
    <script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />
  </Fragment>`
);
// In case the original was Hemeroteca TGP instead of The Great Puzzle Project
slugContent = slugContent.replace(
  /<Layout title=\{`\$\{entry\.title\} \| Hemeroteca TGP`\}>/,
  `<Layout title={\`\${entry.title} | Hemeroteca TGP\`} description={entry.excerpt || entry.description}>
  <Fragment slot="head">
    <meta property="og:type" content="article" />
    <script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />
  </Fragment>`
);

fs.writeFileSync(slugPath, slugContent, 'utf8');
console.log('[slug].astro updated.');
