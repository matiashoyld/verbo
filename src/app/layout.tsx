import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { MainNav } from "~/components/ui/nav";
import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontSans = GeistSans;

export const metadata = {
  title: "Verbo",
  description: "Verbo - Technical Interview Platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${fontSans.variable}`}>
        <ClerkProvider>
          <TRPCReactProvider>
            <MainNav />
            {children}
            <Toaster richColors position="bottom-right" />
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
