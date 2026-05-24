import type { HomepageContentData } from "@/types/content";
import { Accordion } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container } from "@/components/ui/container";

type FAQProps = {
  content: HomepageContentData["faqContent"];
};

export function FAQ({ content }: FAQProps) {
  return (
    <section id="faq" className="section-glow py-20 sm:py-28">
      <Container>
        <SectionHeading title={content.heading} as="h2" />

        <div className="mx-auto mt-14 max-w-3xl">
          <Accordion items={content.items} />
        </div>
      </Container>
    </section>
  );
}
