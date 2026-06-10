import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AdminPromptPanelGate } from "@/components/AdminPromptPanelGate";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Automate Workflow",
  description: "Prompt-driven full-stack workflow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <ThemeScript />
        <ThemeProvider>
          {children}
          <AdminPromptPanelGate />
        </ThemeProvider>
      </body>
    </html>
  );
}
