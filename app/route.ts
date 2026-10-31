import landingPage from '../content/site.html?raw';

export const dynamic = 'force-dynamic';

export function GET() {
  return new Response(landingPage, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}
