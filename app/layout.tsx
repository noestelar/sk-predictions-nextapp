'use client';

import { SessionProvider } from 'next-auth/react';
import { Cinzel_Decorative, Geist_Mono } from "next/font/google";
import Header from '@/components/header';
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-cinzel-decorative",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzelDecorative.variable} ${geistMono.variable} antialiased`}
      >
        {/* SVG noise filter for metallic texture */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <defs>
            <filter id="noiseFilter" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="linearRGB">
              <feTurbulence type="turbulence" baseFrequency="0.3" numOctaves="4" seed="15" stitchTiles="stitch" result="turbulence" />
              <feSpecularLighting surfaceScale="1" specularConstant="1.8" specularExponent="10" lightingColor="#7957A8" in="turbulence" result="specularLighting">
                <feDistantLight azimuth="3" elevation="50" />
              </feSpecularLighting>
              <feColorMatrix type="saturate" values="0" in="specularLighting" result="colormatrix" />
            </filter>
          </defs>
        </svg>
        
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
