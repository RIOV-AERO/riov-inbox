import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg"],
  experimental: {
    serverActions: {
      // Compose attachments are uploaded straight through the send server
      // action as FormData — default 1MB is too small for real files.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
