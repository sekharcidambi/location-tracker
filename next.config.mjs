/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile Leaflet as it's not compatible with Next.js by default
  transpilePackages: ['react-leaflet', 'leaflet'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
