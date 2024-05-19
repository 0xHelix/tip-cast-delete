// next.config.mjs
export default {
  reactStrictMode: true,
  images: {
    domains: ['occb0ofnixhvqbrv.public.blob.vercel-storage.com'],
  },
  env: {
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
    NEXT_PUBLIC_NEYNAR_CLIENT_ID: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID,
  },
};
