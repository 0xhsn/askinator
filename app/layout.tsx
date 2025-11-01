import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import localFont from "next/font/local";

const sfMono = localFont({
  src: [
    { path: "../public/fonts/SFMono-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/SFMono-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../public/fonts/SFMono-Regular.otf", weight: "400", style: "normal" },
    {
      path: "../public/fonts/SFMono-RegularItalic.otf",
      weight: "400",
      style: "italic",
    },
    { path: "../public/fonts/SFMono-Medium.otf", weight: "500", style: "normal" },
    {
      path: "../public/fonts/SFMono-MediumItalic.otf",
      weight: "500",
      style: "italic",
    },
    { path: "../public/fonts/SFMono-Semibold.otf", weight: "600", style: "normal" },
    {
      path: "../public/fonts/SFMono-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
    { path: "../public/fonts/SFMono-Bold.otf", weight: "700", style: "normal" },
    { path: "../public/fonts/SFMono-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../public/fonts/SFMono-Heavy.otf", weight: "800", style: "normal" },
    { path: "../public/fonts/SFMono-HeavyItalic.otf", weight: "800", style: "italic" },
  ],
  variable: "--font-sf-mono",
  display: "swap",
  fallback: [
    "SF Mono",
    "ui-monospace",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://askinator.pages.dev"),
  title: "ask @macdoos",
  description: "backend bro does frontend stuff kind of project",
  twitter: {
    card: "summary_large_image",
    site: "https://askinator.pages.dev",
    creator: "macdoos",
    images: "https://askinator.pages.dev/twitter_org.png",
  },
  openGraph: {
    type: "website",
    url: "https://askinator.pages.dev",
    title: "ask macdoos",
    description: "ama",
    siteName: "ask @macdoos",
    images: [{ url: "https://askinator.pages.dev/twitter_org.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sfMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
