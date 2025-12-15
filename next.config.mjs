// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use React 18's Strict Mode for better error detection in development
  reactStrictMode: true,
  // Recommended setting for performance optimization on Vercel
  output: 'standalone', 
  // Configure image domains if needed (not strictly required here, but good practice)
  images: {
    remotePatterns: [], 
  },
  // Custom headers for security and caching (good production practice)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
