export const dynamic = 'force-static';

export default function sitemap() {
  const baseUrl = 'https://nmp-website.netlify.app';
  const routes = ['', '/sangha', '/pronami', '/expenses', '/schedule', '/gallery', '/smaranika'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}