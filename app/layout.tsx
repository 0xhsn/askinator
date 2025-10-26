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
  title: "ask @macdoos",
  description: "backend bro does frontend stuff kind of project",
  twitter: {
    card: "summary",
    site: "https://ask.macdoos.lol",
    creator: "macdoos",
    images: "/twitter_org.png",
  },
  openGraph: {
    type: "website",
    url: "https://ask.macdoos.lol",
    title: "ask macdoos",
    description: "ama",
    siteName: "ask @macdoos",
    images: [{ url: "/twitter_org.png" }],
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
