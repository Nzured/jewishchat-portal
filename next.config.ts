import { IMAGE_CDN_HOSTNAME } from "./src/configs/const";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: IMAGE_CDN_HOSTNAME }],
  },
};

export default nextConfig;
