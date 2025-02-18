import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',           // Matches any request to /api/ followed by any path
        destination: 'http://localhost:8000/api/:path*',  // Redirects to the backend running on port 8080
      },
    ]
  },
};

export default nextConfig;
