import type { NextConfig } from "next";
import { EMAIL_CACHE_SECONDS } from "./lib/constants";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg"],
  experimental: {
    staleTimes: {
      dynamic: EMAIL_CACHE_SECONDS,
    },
    serverActions: {
      // Compose attachments are uploaded straight through the send server
      // action as FormData — default 1MB is too small for real files.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
