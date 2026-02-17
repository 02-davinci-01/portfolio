import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Compress output for smaller transfers
  compress: true,

  // Image optimization — serve WebP/AVIF at correct sizes
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1200],
    imageSizes: [60, 72, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  // Aggressive caching for static 3D assets (GLB, HDR, textures) + images
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
      {
        source: "/:path*.(webp|avif|jpg|png|svg)",
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
