export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Discover",
    links: [
      { label: "Browse all", href: "/groups" },
      { label: "Categories", href: "/categories" },
      { label: "Cities", href: "/cities" },
      { label: "Featured", href: "/featured" },
      { label: "Newly Added", href: "/newly-added" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Find new", href: "/groups/new" },
      { label: "Topics", href: "/topics" },
      { label: "Regions", href: "/regions" },
      { label: "Trending", href: "/trending" },
      { label: "Most Popular", href: "/most-popular" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our mission", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "FAQ", href: "/faq" },
      { label: "Press kit", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Listing policy", href: "/policies" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
      { label: "Trust & safety", href: "/trust-safety" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];
