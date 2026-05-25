/** @type {import('next').NextConfig} */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
