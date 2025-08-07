import { withSentryConfig } from '@sentry/nextjs'
import { headers } from './config/security-headers.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'components', 'lib', 'hooks', 'contexts'],
  },
  typescript: {
    // Forçar verificação de tipos
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost', process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '')].filter(Boolean),
    unoptimized: false,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  // Configurações de produção
  productionBrowserSourceMaps: false, // Desabilita source maps em produção
  poweredByHeader: false, // Remove o header X-Powered-By
  compress: true, // Habilita compressão
  generateEtags: true, // Habilita ETags para cache
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: headers,
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Rewrites para API routes
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite para health check
        {
          source: '/health',
          destination: '/api/health',
        },
      ],
    }
  },

  // Configurações de webpack
  webpack: (config, { dev, isServer }) => {
    // Otimizações apenas para produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              chunks: 'all',
            },
          },
        },
      }
    }

    return config
  },
}

// Configuração do Sentry
const sentryWebpackPluginOptions = {
  silent: true,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
}

// Exportar com Sentry em produção
export default process.env.NODE_ENV === 'production'
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig