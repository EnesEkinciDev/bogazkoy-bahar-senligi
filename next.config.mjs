import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(),
  reactStrictMode: true,
};

export default nextConfig;
