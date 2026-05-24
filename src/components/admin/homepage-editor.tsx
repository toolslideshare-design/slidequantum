"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import type { HomepageContentData } from "@/types/content";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminField, adminInputClassName } from "@/components/admin/admin-field";
import { Button } from "@/components/ui/button";

export function HomepageEditor() {
  const [content, setContent] = useState<HomepageContentData | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((res) => res.json())
      .then((data: HomepageContentData) => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });

    setSaving(false);
    setMessage(response.ok ? "Homepage content saved successfully." : "Failed to save content.");
  }

  if (loading || !content) {
    return <p className="text-muted-foreground">Loading homepage content...</p>;
  }

  const input = adminInputClassName();
  const textarea = `${input} min-h-28 resize-y`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Editor</h1>
          <p className="mt-2 text-muted-foreground">
            Edit all homepage sections. Changes appear on the live site after saving.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {message && (
        <p className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          {message}
        </p>
      )}

      <AdminCard title="Hero Section">
        <div className="grid gap-4">
          <AdminField label="Badge">
            <input className={input} value={content.heroContent.badge} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, badge: e.target.value } })} />
          </AdminField>
          <AdminField label="Headline">
            <input className={input} value={content.heroContent.headline} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, headline: e.target.value } })} />
          </AdminField>
          <AdminField label="Subtitle">
            <textarea className={textarea} value={content.heroContent.subtitle} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, subtitle: e.target.value } })} />
          </AdminField>
          <AdminField label="What Is Heading">
            <input className={input} value={content.heroContent.whatIsHeading} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, whatIsHeading: e.target.value } })} />
          </AdminField>
          <AdminField label="What Is Description">
            <textarea className={textarea} value={content.heroContent.whatIs} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, whatIs: e.target.value } })} />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="URL Placeholder">
              <input className={input} value={content.heroContent.urlPlaceholder} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, urlPlaceholder: e.target.value } })} />
            </AdminField>
            <AdminField label="Download Label">
              <input className={input} value={content.heroContent.downloadLabel} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, downloadLabel: e.target.value } })} />
            </AdminField>
            <AdminField label="Preview Label">
              <input className={input} value={content.heroContent.previewLabel} onChange={(e) => setContent({ ...content, heroContent: { ...content.heroContent, previewLabel: e.target.value } })} />
            </AdminField>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="How It Works">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.howItWorksContent.heading} onChange={(e) => setContent({ ...content, howItWorksContent: { ...content.howItWorksContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Intro"><textarea className={textarea} value={content.howItWorksContent.intro} onChange={(e) => setContent({ ...content, howItWorksContent: { ...content.howItWorksContent, intro: e.target.value } })} /></AdminField>
          {content.howItWorksContent.steps.map((step, index) => (
            <div key={index} className="rounded-xl border border-white/10 p-4">
              <p className="mb-3 text-sm font-semibold text-orange-400">Step {index + 1}</p>
              <div className="grid gap-3">
                <AdminField label="Title"><input className={input} value={step.title} onChange={(e) => { const steps = [...content.howItWorksContent.steps]; steps[index] = { ...step, title: e.target.value }; setContent({ ...content, howItWorksContent: { ...content.howItWorksContent, steps } }); }} /></AdminField>
                <AdminField label="Description"><textarea className={textarea} value={step.description} onChange={(e) => { const steps = [...content.howItWorksContent.steps]; steps[index] = { ...step, description: e.target.value }; setContent({ ...content, howItWorksContent: { ...content.howItWorksContent, steps } }); }} /></AdminField>
              </div>
            </div>
          ))}
          <AdminField label="Closing"><textarea className={textarea} value={content.howItWorksContent.closing} onChange={(e) => setContent({ ...content, howItWorksContent: { ...content.howItWorksContent, closing: e.target.value } })} /></AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Differentiators">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.differentiatorsContent.heading} onChange={(e) => setContent({ ...content, differentiatorsContent: { ...content.differentiatorsContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Body"><textarea className={textarea} value={content.differentiatorsContent.body} onChange={(e) => setContent({ ...content, differentiatorsContent: { ...content.differentiatorsContent, body: e.target.value } })} /></AdminField>
        </div>
      </AdminCard>

      <AdminCard title="Formats Section">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.formatsContent.heading} onChange={(e) => setContent({ ...content, formatsContent: { ...content.formatsContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Intro"><textarea className={textarea} value={content.formatsContent.intro} onChange={(e) => setContent({ ...content, formatsContent: { ...content.formatsContent, intro: e.target.value } })} /></AdminField>
          {content.formatsContent.items.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 p-4">
              <AdminField label="Title"><input className={input} value={item.title} onChange={(e) => { const items = [...content.formatsContent.items]; items[index] = { ...item, title: e.target.value }; setContent({ ...content, formatsContent: { ...content.formatsContent, items } }); }} /></AdminField>
              <AdminField label="Description"><textarea className={textarea} value={item.description} onChange={(e) => { const items = [...content.formatsContent.items]; items[index] = { ...item, description: e.target.value }; setContent({ ...content, formatsContent: { ...content.formatsContent, items } }); }} /></AdminField>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Features">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.featuresContent.heading} onChange={(e) => setContent({ ...content, featuresContent: { ...content.featuresContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Intro"><textarea className={textarea} value={content.featuresContent.intro} onChange={(e) => setContent({ ...content, featuresContent: { ...content.featuresContent, intro: e.target.value } })} /></AdminField>
          {content.featuresContent.items.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="Title"><input className={input} value={item.title} onChange={(e) => { const items = [...content.featuresContent.items]; items[index] = { ...item, title: e.target.value }; setContent({ ...content, featuresContent: { ...content.featuresContent, items } }); }} /></AdminField>
                <AdminField label="Icon"><input className={input} value={item.icon} onChange={(e) => { const items = [...content.featuresContent.items]; items[index] = { ...item, icon: e.target.value }; setContent({ ...content, featuresContent: { ...content.featuresContent, items } }); }} /></AdminField>
              </div>
              <AdminField label="Description"><textarea className={textarea} value={item.description} onChange={(e) => { const items = [...content.featuresContent.items]; items[index] = { ...item, description: e.target.value }; setContent({ ...content, featuresContent: { ...content.featuresContent, items } }); }} /></AdminField>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Trusted Users">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.trustedUsersContent.heading} onChange={(e) => setContent({ ...content, trustedUsersContent: { ...content.trustedUsersContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Intro"><textarea className={textarea} value={content.trustedUsersContent.intro} onChange={(e) => setContent({ ...content, trustedUsersContent: { ...content.trustedUsersContent, intro: e.target.value } })} /></AdminField>
          {content.trustedUsersContent.items.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <AdminField label="Title"><input className={input} value={item.title} onChange={(e) => { const items = [...content.trustedUsersContent.items]; items[index] = { ...item, title: e.target.value }; setContent({ ...content, trustedUsersContent: { ...content.trustedUsersContent, items } }); }} /></AdminField>
                <AdminField label="Icon"><input className={input} value={item.icon} onChange={(e) => { const items = [...content.trustedUsersContent.items]; items[index] = { ...item, icon: e.target.value }; setContent({ ...content, trustedUsersContent: { ...content.trustedUsersContent, items } }); }} /></AdminField>
              </div>
              <AdminField label="Description"><textarea className={textarea} value={item.description} onChange={(e) => { const items = [...content.trustedUsersContent.items]; items[index] = { ...item, description: e.target.value }; setContent({ ...content, trustedUsersContent: { ...content.trustedUsersContent, items } }); }} /></AdminField>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Comparison Table">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.comparisonContent.heading} onChange={(e) => setContent({ ...content, comparisonContent: { ...content.comparisonContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Subheading"><textarea className={textarea} value={content.comparisonContent.subheading} onChange={(e) => setContent({ ...content, comparisonContent: { ...content.comparisonContent, subheading: e.target.value } })} /></AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Pros Column Label"><input className={input} value={content.comparisonContent.prosColumnLabel} onChange={(e) => setContent({ ...content, comparisonContent: { ...content.comparisonContent, prosColumnLabel: e.target.value } })} /></AdminField>
            <AdminField label="Cons Column Label"><input className={input} value={content.comparisonContent.consColumnLabel} onChange={(e) => setContent({ ...content, comparisonContent: { ...content.comparisonContent, consColumnLabel: e.target.value } })} /></AdminField>
          </div>
          {content.comparisonContent.rows.map((row, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-2">
              <AdminField label={`Pros Row ${index + 1}`}><input className={input} value={row.pro} onChange={(e) => { const rows = [...content.comparisonContent.rows]; rows[index] = { ...row, pro: e.target.value }; setContent({ ...content, comparisonContent: { ...content.comparisonContent, rows } }); }} /></AdminField>
              <AdminField label={`Cons Row ${index + 1}`}><input className={input} value={row.con} onChange={(e) => { const rows = [...content.comparisonContent.rows]; rows[index] = { ...row, con: e.target.value }; setContent({ ...content, comparisonContent: { ...content.comparisonContent, rows } }); }} /></AdminField>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="FAQ">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.faqContent.heading} onChange={(e) => setContent({ ...content, faqContent: { ...content.faqContent, heading: e.target.value } })} /></AdminField>
          {content.faqContent.items.map((item, index) => (
            <div key={index} className="rounded-xl border border-white/10 p-4">
              <AdminField label="Question"><input className={input} value={item.question} onChange={(e) => { const items = [...content.faqContent.items]; items[index] = { ...item, question: e.target.value }; setContent({ ...content, faqContent: { ...content.faqContent, items } }); }} /></AdminField>
              <AdminField label="Answer"><textarea className={textarea} value={item.answer} onChange={(e) => { const items = [...content.faqContent.items]; items[index] = { ...item, answer: e.target.value }; setContent({ ...content, faqContent: { ...content.faqContent, items } }); }} /></AdminField>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Conclusion">
        <div className="grid gap-4">
          <AdminField label="Heading"><input className={input} value={content.conclusionContent.heading} onChange={(e) => setContent({ ...content, conclusionContent: { ...content.conclusionContent, heading: e.target.value } })} /></AdminField>
          <AdminField label="Body"><textarea className={textarea} value={content.conclusionContent.body} onChange={(e) => setContent({ ...content, conclusionContent: { ...content.conclusionContent, body: e.target.value } })} /></AdminField>
        </div>
      </AdminCard>
    </div>
  );
}
