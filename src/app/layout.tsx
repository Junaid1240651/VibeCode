/**
 * Root Layout Component
 * 
 * This is the main layout component that wraps the entire application.
 * It sets up all the necessary providers and global configurations.
 * 
 * Key Features:
 * - Font configuration with Geist Sans and Geist Mono
 * - Authentication with Clerk
 * - tRPC client provider for type-safe API calls
 * - Theme provider for dark/light mode support
 * - Toast notifications with Sonner
 * - Global CSS styles
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

// Configure Geist Sans font with CSS variable for usage throughout the app
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure Geist Mono font for code blocks and monospace text
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application (SEO and browser tab)
export const metadata: Metadata = {
  title: "VibeCode - AI-Powered Code Generation",
  description: "Create web applications by chatting with AI. Built with Next.js, TypeScript, and modern web technologies.",
};

/**
 * Root Layout Component
 * 
 * This component wraps the entire application and provides:
 * 1. Authentication context via ClerkProvider
 * 2. API communication via tRPC
 * 3. Theme management for dark/light modes
 * 4. Global font variables
 * 5. Toast notification system
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Clerk authentication provider with custom brand color
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#2aea4a" // Custom green brand color
       }
     }}
    >
    {/* tRPC provider for type-safe API communication */}
    <TRPCReactProvider>
      <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Theme provider for dark/light mode support */}
          <ThemeProvider
            attribute='class'              // Use class-based theme switching
            defaultTheme="system"          // Default to system preference
            enableSystem                   // Allow system theme detection
            disableTransitionOnChange      // Disable transitions when theme changes
          >
            {children}
            {/* Global toast notification system */}
            <Toaster />
          </ThemeProvider>
      </body>
      </html>
      </TRPCReactProvider>
    </ClerkProvider>
  );
}
