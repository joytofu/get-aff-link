// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // This line tells Next.js to build a static site
  output: 'export',

  // If you use next/image, you need this for static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;