import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // output: 'export',
  // images: {
  //   unoptimized: true, // This is the magic line
  // },
};

export default nextConfig;

