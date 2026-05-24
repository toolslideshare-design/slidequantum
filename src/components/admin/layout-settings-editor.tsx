"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import type { FooterLinkGroup, LayoutLink, LayoutSettings } from "@/types/content";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminField, adminInputClassName } from "@/components/admin/admin-field";
import { Button } from "@/components/ui/button";

const emptyLink: LayoutLink = { label: "", href: "" };

function updateLink(
  links: LayoutLink[],
  index: number,
  field: keyof LayoutLink,
  value: string
) {
  return links.map((link, itemIndex) =>
    itemIndex === index ? { ...link, [field]: value } : link
  );
}

export function LayoutSettingsEditor() {
  const [settings, setSettings] = useState<LayoutSettings | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/layout-settings")
      .then((res) => res.json())
      .then((data: LayoutSettings) => setSettings(data));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/layout-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
    setMessage(
      response.ok
        ? "Layout settings saved successfully."
        : "Failed to save layout settings."
    );
  }

  if (!settings) {
    return <p className="text-muted-foreground">Loading layout settings...</p>;
  }

  const input = adminInputClassName();
  const textarea = `${input} min-h-28 resize-y`;

  function setHeaderLinks(links: LayoutLink[]) {
    setSettings((current) =>
      current
        ? {
            ...current,
            header: { ...current.header, navigationLinks: links },
          }
        : current
    );
  }

  function setFooterGroups(groups: FooterLinkGroup[]) {
    setSettings((current) =>
      current
        ? {
            ...current,
            footer: { ...current.footer, linkGroups: groups },
          }
        : current
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Layout Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Edit website header, footer, navigation, CTA, and social links.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Layout"}
        </Button>
      </div>

      {message && (
        <p className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
          {message}
        </p>
      )}

      <AdminCard title="Header">
        <div className="grid gap-4">
          <AdminField label="Logo Text">
            <input
              className={input}
              value={settings.header.logoText}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  header: { ...settings.header, logoText: event.target.value },
                })
              }
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Login Button Text">
              <input
                className={input}
                value={settings.header.loginButtonText}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    header: {
                      ...settings.header,
                      loginButtonText: event.target.value,
                    },
                  })
                }
              />
            </AdminField>
            <AdminField label="Header CTA Button Text">
              <input
                className={input}
                value={settings.header.ctaButtonText}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    header: {
                      ...settings.header,
                      ctaButtonText: event.target.value,
                    },
                  })
                }
              />
            </AdminField>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-semibold">Navigation Links</h3>
              <Button
                size="sm"
                type="button"
                onClick={() => setHeaderLinks([...settings.header.navigationLinks, emptyLink])}
              >
                <Plus className="size-4" />
                Add Link
              </Button>
            </div>
            <div className="space-y-3">
              {settings.header.navigationLinks.map((link, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    className={input}
                    value={link.label}
                    placeholder="Label"
                    onChange={(event) =>
                      setHeaderLinks(
                        updateLink(
                          settings.header.navigationLinks,
                          index,
                          "label",
                          event.target.value
                        )
                      )
                    }
                  />
                  <input
                    className={input}
                    value={link.href}
                    placeholder="/path"
                    onChange={(event) =>
                      setHeaderLinks(
                        updateLink(
                          settings.header.navigationLinks,
                          index,
                          "href",
                          event.target.value
                        )
                      )
                    }
                  />
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      setHeaderLinks(
                        settings.header.navigationLinks.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Footer">
        <div className="grid gap-4">
          <AdminField label="Footer Description">
            <textarea
              className={textarea}
              value={settings.footer.description}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, description: event.target.value },
                })
              }
            />
          </AdminField>

          <AdminField label="Copyright Text">
            <input
              className={input}
              value={settings.footer.copyrightText}
              onChange={(event) =>
                setSettings({
                  ...settings,
                  footer: { ...settings.footer, copyrightText: event.target.value },
                })
              }
            />
          </AdminField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Privacy Policy Link Text">
              <input
                className={input}
                value={settings.footer.privacyPolicyLink.label}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      privacyPolicyLink: {
                        ...settings.footer.privacyPolicyLink,
                        label: event.target.value,
                      },
                    },
                  })
                }
              />
            </AdminField>
            <AdminField label="Privacy Policy URL">
              <input
                className={input}
                value={settings.footer.privacyPolicyLink.href}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      privacyPolicyLink: {
                        ...settings.footer.privacyPolicyLink,
                        href: event.target.value,
                      },
                    },
                  })
                }
              />
            </AdminField>
            <AdminField label="Contact Link Text">
              <input
                className={input}
                value={settings.footer.contactLink.label}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      contactLink: {
                        ...settings.footer.contactLink,
                        label: event.target.value,
                      },
                    },
                  })
                }
              />
            </AdminField>
            <AdminField label="Contact URL">
              <input
                className={input}
                value={settings.footer.contactLink.href}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      contactLink: {
                        ...settings.footer.contactLink,
                        href: event.target.value,
                      },
                    },
                  })
                }
              />
            </AdminField>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Footer Link Groups">
        <div className="space-y-5">
          {settings.footer.linkGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="rounded-2xl border border-white/10 p-4">
              <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  className={input}
                  value={group.title}
                  placeholder="Group title"
                  onChange={(event) => {
                    const groups = [...settings.footer.linkGroups];
                    groups[groupIndex] = { ...group, title: event.target.value };
                    setFooterGroups(groups);
                  }}
                />
                <Button
                  size="sm"
                  type="button"
                  onClick={() => {
                    const groups = [...settings.footer.linkGroups];
                    groups[groupIndex] = {
                      ...group,
                      links: [...group.links, emptyLink],
                    };
                    setFooterGroups(groups);
                  }}
                >
                  <Plus className="size-4" />
                  Add Link
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    setFooterGroups(
                      settings.footer.linkGroups.filter((_, itemIndex) => itemIndex !== groupIndex)
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {group.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      className={input}
                      value={link.label}
                      placeholder="Label"
                      onChange={(event) => {
                        const groups = [...settings.footer.linkGroups];
                        groups[groupIndex] = {
                          ...group,
                          links: updateLink(group.links, linkIndex, "label", event.target.value),
                        };
                        setFooterGroups(groups);
                      }}
                    />
                    <input
                      className={input}
                      value={link.href}
                      placeholder="/path"
                      onChange={(event) => {
                        const groups = [...settings.footer.linkGroups];
                        groups[groupIndex] = {
                          ...group,
                          links: updateLink(group.links, linkIndex, "href", event.target.value),
                        };
                        setFooterGroups(groups);
                      }}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        const groups = [...settings.footer.linkGroups];
                        groups[groupIndex] = {
                          ...group,
                          links: group.links.filter((_, itemIndex) => itemIndex !== linkIndex),
                        };
                        setFooterGroups(groups);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setFooterGroups([
                ...settings.footer.linkGroups,
                { title: "New Group", links: [emptyLink] },
              ])
            }
          >
            <Plus className="size-4" />
            Add Footer Group
          </Button>
        </div>
      </AdminCard>

      <AdminCard title="Social Links">
        <div className="space-y-3">
          {settings.footer.socialLinks.map((link, index) => (
            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <input
                className={input}
                value={link.label}
                placeholder="Label"
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      socialLinks: updateLink(
                        settings.footer.socialLinks,
                        index,
                        "label",
                        event.target.value
                      ),
                    },
                  })
                }
              />
              <input
                className={input}
                value={link.href}
                placeholder="https://..."
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      socialLinks: updateLink(
                        settings.footer.socialLinks,
                        index,
                        "href",
                        event.target.value
                      ),
                    },
                  })
                }
              />
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    footer: {
                      ...settings.footer,
                      socialLinks: settings.footer.socialLinks.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    },
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setSettings({
                ...settings,
                footer: {
                  ...settings.footer,
                  socialLinks: [...settings.footer.socialLinks, emptyLink],
                },
              })
            }
          >
            <Plus className="size-4" />
            Add Social Link
          </Button>
        </div>
      </AdminCard>
    </div>
  );
}
