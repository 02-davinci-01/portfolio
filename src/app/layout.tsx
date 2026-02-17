import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vedant Nagwanshi — Creative Developer",
  description:
    "Portfolio of Vedant Nagwanshi — Developer & Creative Technologist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Enable Meshopt decoder for compressed GLB models */}
        <script
          dangerouslySetInnerHTML={{
            __html: `self.ModelViewerElement = self.ModelViewerElement || {};
self.ModelViewerElement.meshoptDecoderLocation = 'https://cdn.jsdelivr.net/npm/meshoptimizer/meshopt_decoder.js';`,
          }}
        />
        {/* Preload critical 3D assets — hero statue + environment map */}
        <link
          rel="preload"
          href="/hl._alexius.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/environment.hdr"
          as="fetch"
          crossOrigin="anonymous"
        />
        {/* Prefetch below-fold GLB — low priority, fetched when idle */}
        <link
          rel="prefetch"
          href="/personal_computer_pbr.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${jetbrains.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
