import { handleReadingChat } from '../lib/reading-guide.mjs';

export default {
  fetch(request) {
    const headers = new Headers(request.headers);
    // Reuse the existing throttle with Vercel's forwarded client address.
    const ip = (headers.get('x-vercel-forwarded-for') || headers.get('x-forwarded-for') || '').split(',')[0].trim();
    headers.delete('cf-connecting-ip');
    if (ip) headers.set('cf-connecting-ip', ip);
    return handleReadingChat(new Request(request, { headers }), {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      CHAT_MODEL: process.env.CHAT_MODEL || 'openai/gpt-4.1-mini',
    });
  },
};
