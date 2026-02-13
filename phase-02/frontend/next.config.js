/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  compiler: {
    removeConsole: false,
  },
  experimental: {
    optimizeCss: false,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
  
    config.resolve.alias = {
      ...config.resolve.alias,
      'lightningcss': false,
    };
    
    return config;
  },
}

module.exports = nextConfig
