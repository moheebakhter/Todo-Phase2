/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Enable strict mode for better development experience.
   */
  reactStrictMode: true,

  /**
   * Environment variables available to the browser.
   * NEXT_PUBLIC_ prefixed variables are automatically exposed.
   */
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  },

  /**
   * TypeScript configuration.
   */
  typescript: {
    // Type errors are caught in CI, not during build
    ignoreBuildErrors: false,
  },

  /**
   * ESLint configuration.
   */
  eslint: {
    // Lint errors are caught in CI, not during build
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
