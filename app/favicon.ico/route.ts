export const runtime = "nodejs";

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0891b2"/>
  <path d="M12 38c7 0 7-5 14-5s7 5 14 5 7-5 12-5" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
  <path d="M12 48c7 0 7-5 14-5s7 5 14 5 7-5 12-5" fill="none" stroke="#cffafe" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
