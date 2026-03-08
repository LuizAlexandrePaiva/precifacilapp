import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://precifacil.app.br';
const SITE_NAME = 'PreciFácil';
const OG_IMAGE = 'https://precifacil.app.br/og-image.png';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}

export function SEO({ title, description, path = '', noindex = false }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === '/' || path === '' ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
}
