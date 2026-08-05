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
      { label: "Browse all", href: "/external/groups" },
      { label: "Categories", href: "/external/categories" },
      { label: "Cities", href: "/external/cities" },
      { label: "Featured", href: "/external/featured" },
      { label: "Newly Added", href: "/external/newly-added" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Find new", href: "/external/groups/new" },
      { label: "Topics", href: "/external/topics" },
      { label: "Regions", href: "/external/regions" },
      { label: "Trending", href: "/external/trending" },
      { label: "Most Popular", href: "/external/most-popular" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our mission", href: "/external/about" },
      { label: "How it works", href: "/external/how-it-works" },
      { label: "FAQ", href: "/external/faq" },
      { label: "Press kit", href: "/external/press" },
      { label: "Contact", href: "/external/contact" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "Privacy policy", href: "/external/privacy" },
      { label: "Terms of service", href: "/external/terms" },
      { label: "Cookie policy", href: "/external/cookies" },
      { label: "Trust & safety", href: "/external/trust-safety" },
      { label: "Accessibility", href: "/external/accessibility" },
    ],
  },
];
