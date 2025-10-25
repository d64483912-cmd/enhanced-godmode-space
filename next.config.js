/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Removed static export to enable API routes for Vercel deployment
  // output: "export",
  // distDir: 'build',
  
  // Optional: Add a trailing slash to all paths `/about` -> `/about/`
  // trailingSlash: true,
};

module.exports = nextConfig;
