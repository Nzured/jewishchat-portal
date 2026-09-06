import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { EmailVerificationGate } from "@/components/layout/app/EmailVerificationGate";
import { GlobalLoader } from "@/components/layout/app/GlobalLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Toaster } from "@/components/ui/Sonner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { CANONICAL_SITE_URL, EXTERNAL_GROUPS_PATH, SITE_NAME } from "@/configs/const";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import type { Metadata } from "next";
import "../styles/globals.css";

const DEFAULT_OG_IMAGE = `${CANONICAL_SITE_URL}/svgs/logo.svg`;
const DEFAULT_DESCRIPTION =
  "Discover and join WhatsApp groups for Jewish businesses, organizations, and communities.";

const SITEWIDE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${CANONICAL_SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${CANONICAL_SITE_URL}/`,
      logo: DEFAULT_OG_IMAGE,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${CANONICAL_SITE_URL}/#website`,
      url: `${CANONICAL_SITE_URL}/`,
      name: SITE_NAME,
      publisher: { "@id": `${CANONICAL_SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${CANONICAL_SITE_URL}${EXTERNAL_GROUPS_PATH}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

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
  axes: ["opsz", "wdth"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: ["400"],
  style: ["italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-surface-bg">
        <JsonLd data={SITEWIDE_JSON_LD} />
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
