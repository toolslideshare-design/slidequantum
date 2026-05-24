import { Download, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";
import { getLayoutSettings } from "@/lib/data/layout-settings";
import { Container } from "@/components/ui/container";
import type { LayoutLink } from "@/types/content";

export async function Footer() {
  const settings = await getLayoutSettings();
  const year = new Date().getFullYear();
  const copyright = settings.footer.copyrightText.replace("{year}", String(year));

  return (
    <footer className="border-t border-white/5 bg-black/40">
      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-bold transition-opacity hover:opacity-90"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20">
                <Download className="size-5" />
              </span>
              {settings.header.logoText}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {settings.footer.description}
            </p>
          </div>

          {settings.footer.linkGroups.map((group) => (
            <FooterColumn
              key={group.title}
              title={group.title}
              links={group.links}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">{copyright}</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href={settings.footer.privacyPolicyLink.href}
              className="text-sm text-muted-foreground transition-colors hover:text-orange-400"
            >
              {settings.footer.privacyPolicyLink.label}
            </Link>
            <Link
              href={settings.footer.contactLink.href}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-orange-400"
            >
              <Mail className="size-4" />
              {settings.footer.contactLink.label}
            </Link>
            {settings.footer.socialLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-orange-400"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
                {link.href.startsWith("http") && <ExternalLink className="size-3" />}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly LayoutLink[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors duration-300 hover:text-orange-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
