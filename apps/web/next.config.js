/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  transpilePackages: [
    "@copilotkit/react-core",
    "@copilotkit/react-textarea",
    "@copilotkit/react-ui",
  ],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      }
    ],
  },
}

module.exports = nextConfig
