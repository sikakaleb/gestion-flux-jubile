/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Disabled to allow API routes (Serverless Functions)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // images: { unoptimized: true }, // Not needed if not using static export
  // trailingSlash: true,
};

module.exports = nextConfig;
