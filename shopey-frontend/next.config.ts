import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiHost = apiUrl ? new URL(apiUrl).hostname : undefined;
const apiProtocol: "http" | "https" = apiUrl?.startsWith("https") ? "https" : "http";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/securedlink",
        destination: "/admin",
      },
      {
        source: "/securedlink/:path*",
        destination: "/admin/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/securedlink",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/securedlink/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      ...(apiHost
        ? [
            {
              protocol: apiProtocol,
              hostname: apiHost,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
