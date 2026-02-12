import type { Metadata, Viewport } from "next";
import { Geist, Nova_Square } from "next/font/google";
import "./globals.css";
import Provider from "../providers/provider";
import LoadingOverlay from "@/components/loading/loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistNova = Nova_Square({
  weight: "400",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#8A0000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://caramelo.angra.io"),
  title: "Caramelo Casino",
  description: "O Casino Mais Viciante da Web3 - Crash, Caramelinho, Coinflip, Minas, Dados",
  manifest: "/manifest.json",
  icons: {
    icon: "/icone.png",
    apple: "/icone.png",
  },
  openGraph: {
    title: "Caramelo Casino",
    description: "O Casino Mais Viciante da Web3 - Crash, Caramelinho, Coinflip, Minas, Dados",
    images: [
      {
        url: "/og-image.jpg",
        width: 450,
        height: 307,
        alt: "Caramelo Casino",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caramelo Casino",
    description: "O Casino Mais Viciante da Web3",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Caramelo Casino",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${geistSans.variable} ${geistNova.className}`}>
        <Provider>
          <LoadingOverlay />
          {children}
        </Provider>
      </body>
    </html>
  );
}
