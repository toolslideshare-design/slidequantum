import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getLayoutSettings } from "@/lib/data/layout-settings";
import { getCurrentUser } from "@/lib/user-auth";
import { CursorGlow } from "@/components/effects/cursor-glow-loader";
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [layoutSettings, user] = await Promise.all([
    getLayoutSettings(),
    getCurrentUser(),
  ]);

  return (
    <ThemeProvider forcedTheme="dark" enableSystem={false}>
      <MotionProvider>
        <div className="gradient-bg premium-ambient flex min-h-screen flex-col">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <CursorGlow />
          <Navbar header={layoutSettings.header} user={user} />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </MotionProvider>
    </ThemeProvider>
  );
}
