import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { EmailVerificationGate } from "@/components/layout/app/EmailVerificationGate";
import { GlobalLoader } from "@/components/layout/app/GlobalLoader";
import { Toaster } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { NAME_PART_ONE, NAME_PART_TWO } from "@/configs/const";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import type { Metadata } from "next";
import "../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  weight: ["600"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: NAME_PART_ONE + NAME_PART_TWO,
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-bg">
        <TooltipProvider>
          <UserProvider>
            <AuthProvider>
              {children}
              <EmailVerificationGate />
            </AuthProvider>
          </UserProvider>
          <GlobalLoader />
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
