import type { NextConfig } from 'next';

/**
 * The browser always calls /api on the same origin; Next.js forwards it to the PHP backend:
 *   /api/products/list.php  ->  http://mithudi.mooo.com/api/products/list.php
 *   /media/uploads/a.jpg    ->  http://mithudi.mooo.com/uploads/a.jpg   (product images)
 * No CORS headers are needed in PHP, and an https site can use the http API.
 */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET || 'http://mithudi.mooo.com').replace(/\/$/, '');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_PROXY_TARGET}/api/:path*` },
      { source: '/media/:path*', destination: `${API_PROXY_TARGET}/:path*` },
    ];
  },
};

export default nextConfig;
