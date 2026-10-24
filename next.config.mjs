/** @type {import('next').NextConfig} */
const nextConfig = {
  // tailwind v4 plugs into turbopack through this loader
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // photos are already shrunk in the browser before upload,
  // so we skip next's image optimizer (and its free-plan limits)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
