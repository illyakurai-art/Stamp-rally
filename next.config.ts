import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.102.137.159", "192.168.1.200", "192.168.1.101"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qoniejhhzixwzgtzlngo.supabase.co",
        pathname: "/storage/v1/object/public/artists-cards/**",
      },
      {
        protocol: "https",
        hostname: "qoniejhhzixwzgtzlngo.supabase.co",
        pathname: "/storage/v1/render/image/public/artists-cards/**",
      },
    ],
  },
};

export default nextConfig;
