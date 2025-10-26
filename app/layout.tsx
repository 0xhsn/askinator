import type { Metadata } from "next";
import { Rubik, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const rubikSans = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "arabic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body
        className={`${rubikSans.variable} ${geistMono.variable} antialiased`}
      >
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
