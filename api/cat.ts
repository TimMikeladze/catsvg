import { handleCatRequest } from '../src/server/handler';

export const config = { runtime: 'edge' };

/** Serves every `/cat/*` URL as an SVG. See vercel.json for the rewrites. */
export default function handler(request: Request): Response {
  const { status, body, headers } = handleCatRequest(new URL(request.url));
  return new Response(body, { status, headers });
}
