import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Aggressive caching for static 3D assets (GLB, HDR, textures)
  async headers() {
    return [
      {
        source: "/:path*.(glb|gltf|hdr|bin|ktx2|drc)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*.(woff2|woff)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Transpile model-viewer for SSR compatibility
  transpilePackages: ["@google/model-viewer"],

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
};

export default nextConfig;
