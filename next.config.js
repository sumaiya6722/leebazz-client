const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    workerThreads: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

module.exports = nextConfig;
