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
};

export default nextConfig;
