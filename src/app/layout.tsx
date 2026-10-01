import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { NavigationProvider } from "@/components/providers/navigation-provider";
import "./globals.css";

/* ── Root Layout ──────────────────────────────────────────────────────────── */

/* ── Metadata ─────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default:  "PRISM EDU",
    template: "%s | PRISM EDU",
  },
  description:
    "Student Dropout Prediction & Intervention Platform — AI-powered insights to keep every student on track.",
  keywords: [
    "student dropout prediction",
    "early intervention",
    "academic analytics",
    "learning management",
    "AI education",
    "PRISM EDU",
  ],
  authors: [{ name: "PRISM EDU Team" }],
  creator: "PRISM EDU",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "/",
    siteName:    "PRISM EDU",
    title:       "PRISM EDU — Student Dropout Prediction & Intervention",
    description: "AI-powered early warning system to identify at-risk students and trigger timely interventions.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PRISM EDU" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "PRISM EDU",
    description: "AI-powered student dropout prediction platform.",
    images:      ["/og-image.png"],
  },
  robots: {
    index:             true,
    follow:            true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#0f172a"  },
  ],
  width:        "device-width",
  initialScale: 1,
};

/* ── Root Layout ──────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProvider>
            {children}
          </NavigationProvider>

          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
              classNames: {
                toast:       "font-sans text-sm",
                title:       "font-semibold",
                description: "text-muted-foreground",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
