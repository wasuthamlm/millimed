import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sequelize resolves its dialect driver (pg) via a dynamic require, which
  // bundlers can't statically analyze — load it natively instead of bundling.
  serverExternalPackages: ["sequelize", "pg", "pg-hstore"],
  // Hide the dev-mode route indicator badge.
  devIndicators: false,
  images: {
    // Cloudinary URLs embed a version segment (e.g. /v1786691830/), so a given
    // URL's bytes never change — safe (and important) to cache Next's optimized
    // output far longer than the default, avoiding repeat re-fetch/re-encode.
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
      },
    ],
  },
  async redirects() {
    return [
      // "กิจกรรมเพื่อสังคม" and "กิจกรรมภายใน" content moved into the unified
      // "ข่าวสารและกิจกรรม" (/news) listing, filterable by category.
      { source: "/csr/sharing-love", destination: "/news?category=csr", permanent: true },
      { source: "/csr/education", destination: "/news?category=csr", permanent: true },
      { source: "/internal-activities/kick-off-outing", destination: "/news?category=internal", permanent: true },
      { source: "/internal-activities/family", destination: "/news?category=internal", permanent: true },
      { source: "/internal-activities/recreation", destination: "/news?category=internal", permanent: true },
      // /articles was an unlinked, fully-duplicate listing of the same content.
      { source: "/articles", destination: "/news", permanent: true },
      { source: "/articles/:slug", destination: "/news/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
