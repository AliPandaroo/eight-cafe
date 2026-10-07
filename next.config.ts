import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@libsql/client"],
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    localPatterns: [{ pathname: "/uploads/**" }, { pathname: "/static/**" }],
  },
  allowedDevOrigins: ["172.25.240.1"],
};

export default nextConfig;
