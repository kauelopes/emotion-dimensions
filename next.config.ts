import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo>/ — keep in sync with repo name.
const repo = "emotion-dimensions";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
  images: { unoptimized: true },
};

export default nextConfig;
