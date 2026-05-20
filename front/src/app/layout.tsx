import AuthGate from "@/components/authGate";
import MainHeader from "@/components/MainHeader";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/providers/providers";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth System",
  description: "Authentication system with Zod, ShadCN & Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {



  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ReactQueryProvider>
          <Providers>
            <AuthGate>
              <MainHeader />
              <main>{children}</main>
            </AuthGate>
          </Providers>
        </ReactQueryProvider>

        <Toaster
          position="bottom-right"
        />
      </body>
    </html>
  );
}
