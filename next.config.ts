import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sequelize resolves its dialect driver (pg) via a dynamic require, which
  // bundlers can't statically analyze — load it natively instead of bundling.
  serverExternalPackages: ["sequelize", "pg", "pg-hstore"],
  // Hide the dev-mode route indicator badge.
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
      },
    ],
  },
};

export default nextConfig;
