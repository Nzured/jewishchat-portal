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

// FR-SEO-SD-01/02 (Section 5.1) — Organization + WebSite + SearchAction,
// once per page load, via stable @id references every other page's JSON-LD
// links back to. `sameAs` stays empty until real social profile URLs exist
// (FR-SEO-EEAT-02 — no placeholders) — a separate, pending item.
//
// The search target below points at the directory's real query param
// (/groups?q=...) rather than the spec's literal /search example, since
// /search isn't a route this app has — a SearchAction pointing at a 404
// would be worse than not having one.
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
  // Lets every route below set `alternates.canonical` as a site-relative
  // path instead of a full URL. Routes that need their own title/description
  // (home, category, group, ...) override these via their own metadata.
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  // FR-SEO-META-03 — fallback OG/Twitter tags for any route that doesn't set
  // its own (noindexed pages mostly don't bother). `logo.svg` is the only
  // brand image in the repo today; a real raster (PNG/JPG) social-preview
  // image would render more reliably across platforms than an SVG.
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
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-bg">
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
