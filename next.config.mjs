/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure webpack to handle special characters
  webpack: (config) => {
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (oneOfRule.loader && oneOfRule.loader.includes('css-loader')) {
            oneOfRule.options = {
              ...oneOfRule.options,
              url: false,
              import: false,
            };
          }
        });
      }
    });
    return config;
  },
  // Add experimental features to handle special characters
  experimental: {
    forceSwcTransforms: true,
  }
}

export default nextConfig
