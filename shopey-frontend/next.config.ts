import type { NextConfig } from "next";
import path from "path";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiHost = apiUrl ? new URL(apiUrl).hostname : undefined;
const apiProtocol = apiUrl?.startsWith("https") ? "https" : "http";

const nextConfig: NextConfig = {
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
