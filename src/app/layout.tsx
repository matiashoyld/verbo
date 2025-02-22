import "~/styles/globals.css";

import { Inter as FontSans } from "next/font/google";

import { MainNav } from "~/components/ui/nav";
import { TRPCReactProvider } from "~/trpc/react";

const fontSans = FontSans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "verbo.ai - AI-Powered Skill Assessment Platform",
  description:
    "Modern hiring and recruitment processes with AI-driven skill assessments.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={fontSans.variable}>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <TRPCReactProvider>
          <div className="relative flex min-h-screen flex-col">
            <MainNav />
            <div className="flex-1">{children}</div>
          </div>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
