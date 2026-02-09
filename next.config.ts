import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',  // 静的HTMLとして書き出す
  basePath: isProd ? '/life-plan-visualizer' : '',
  assetPrefix: isProd ? '/life-plan-visualizer/' : '',
};

export default nextConfig;
