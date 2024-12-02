/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer, dev }) {
    config.experiments = {
      syncWebAssembly: true, // Change to sync WebAssembly
      layers: true,
    };

    // Add a rule to process WASM files from node_modules
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async", // use 'async' for asyncWebAssembly
    });

    return config;
  },
  async redirects() {
    return process.env.WALLET_NETWORK !== "sbtcDevenv"
      ? [
          // Basic redirect
          {
            source: "/transfer",
            destination: "/" + process.env.WALLET_NETWORK,
            permanent: false,
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
