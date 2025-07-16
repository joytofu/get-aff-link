// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // This line tells Next.js to build a static site
  output: 'export',

  // If you use next/image, you need this for static export
  images: {
    unoptimized: true,
  },

  // Add webpack configuration to handle Markdown files
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source', // 使用webpack5内置的asset/source替代raw-loader
    });
    return config;
  },
};

module.exports = nextConfig;