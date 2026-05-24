import { Container } from "@/components/ui/container";
import { JsonLd } from "@/components/seo/json-ld";
import { createBreadcrumbSchema, createWebPageSchema } from "@/lib/seo/structured-data";

type LegalPageContent = {
  title: string;
  description: string;
  path: string;
  lastUpdated: string;
  sections: readonly {
    heading: string;
    body: string;
  }[];
};

type LegalPageTemplateProps = {
  page: LegalPageContent;
  siteUrl: string;
};

export function LegalPageTemplate({ page, siteUrl }: LegalPageTemplateProps) {
  const breadcrumbSchema = createBreadcrumbSchema(
    [
      { name: "Home", path: "/" },
      { name: page.title, path: page.path },
    ],
    siteUrl
  );

  const webPageSchema = createWebPageSchema({
    title: page.title,
    description: page.description,
    path: page.path,
    siteUrl,
  });

  return (
    <article className="pt-28 pb-16 sm:pt-36 sm:pb-24">
      <JsonLd data={[breadcrumbSchema, webPageSchema]} />
      <Container className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {page.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated:{" "}
          <time dateTime={page.lastUpdated}>
            {new Date(page.lastUpdated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </p>

        <div className="mt-10 space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </Container>
    </article>
  );
}
