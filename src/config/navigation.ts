import type { NavItem } from "@/types";

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

export const footerNav = {
  product: [
    { label: "Download", href: "/" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how-it-works" },
    { label: "Formats", href: "#formats" },
  ],
  resources: [
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "#faq" },
    { label: "Comparison", href: "#comparison" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ],
} as const;
