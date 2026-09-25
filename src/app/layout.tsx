import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { FleetProvider } from "@/lib/use-fleet-socket";
import { ThemeProvider } from "@/components/theme-provider";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://edgefleet.ai"),
  title: "EdgeFleet — Distributed Edge-AI Fleet Coordination for AMRs | SIH 26123",
  description: "Mission-critical, peer-to-peer decentralized AMR fleet coordination for high-density smart automation. Real-time corridor space-time leases, dynamic rerouting, and ISO 3691-4 safety envelopes.",
  keywords: [
    "Edge-AI",
    "AMR",
    "Autonomous Mobile Robots",
    "Fleet Coordination",
    "SIH 2026",
    "Problem Statement 26123",
    "Smart Warehouse",
    "Decentralized Robotics",
    "ROS 2",
    "Zenoh DDS",
    "ISO 3691-4",
    "BEL",
  ],
  authors: [{ name: "EdgeFleet Engineering Team" }],
  openGraph: {
    title: "EdgeFleet — Distributed Edge-AI AMR Fleet Coordination",
    description: "Eliminating single-point-of-failure dispatchers with onboard peer-to-peer arbitration for industrial smart warehouses.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/hero-amr-fleet.jpg",
        width: 1200,
        height: 675,
        alt: "Autonomous Mobile Robots Operating in a High-Tech Smart Warehouse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EdgeFleet — Distributed Edge-AI Fleet Coordination for AMRs",
    description: "Decentralized space-time leases & Contract-Net task auctions for autonomous mobile robots in smart facilities.",
    images: ["/images/hero-amr-fleet.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F19" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* Inline script to prevent theme flashing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('edgefleet_theme');
                  var theme = (stored === 'dark' || stored === 'light') 
                    ? stored 
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <FleetProvider>{children}</FleetProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
