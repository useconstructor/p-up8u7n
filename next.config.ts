import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/*": ["./migrations/*.sql"] },
  async headers() {
    return [
      {
        source: "/confirmacion/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};
export default nextConfig;
