/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'election69.livetubex.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Common Google Photos domain
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com', // Wildcard for other google domains
      }
    ],
  },
};

export default nextConfig;
