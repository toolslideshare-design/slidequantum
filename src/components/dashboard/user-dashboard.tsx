"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  LogOut,
  Settings,
  Trash2,
  User,
} from "lucide-react";
import { FormEvent, useState } from "react";
import type {
  DownloadHistoryItem,
  PublicUser,
  SavedPresentation,
} from "@/types/content";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";

type UserDashboardProps = {
  user: PublicUser;
  initialHistory: DownloadHistoryItem[];
  initialSavedPresentations: SavedPresentation[];
};

type Toast = {
  type: "success" | "error";
  message: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-8 text-center">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function UserDashboard({
  user,
  initialHistory,
  initialSavedPresentations,
}: UserDashboardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [history, setHistory] = useState(initialHistory);
  const [savedPresentations, setSavedPresentations] = useState(
    initialSavedPresentations
  );
  const [toast, setToast] = useState<Toast | null>(null);
  const [loadingId, setLoadingId] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [accountForm, setAccountForm] = useState({
    name: user.name,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function showToast(type: Toast["type"], message: string) {
    setToast({ type, message });
  }

  async function deleteHistoryItem(itemId: string) {
    setLoadingId(itemId);

    try {
      const response = await fetch(`/api/user/download-history/${itemId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast("error", data.error ?? "Could not delete history item.");
        return;
      }

      setHistory((items) => items.filter((item) => item.id !== itemId));
      showToast("success", "Download history item deleted.");
    } catch {
      showToast("error", "Could not delete history item.");
    } finally {
      setLoadingId("");
    }
  }

  async function deleteSavedPresentation(itemId: string) {
    setLoadingId(itemId);

    try {
      const response = await fetch(`/api/user/saved-presentations/${itemId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast("error", data.error ?? "Could not remove presentation.");
        return;
      }

      setSavedPresentations((items) =>
        items.filter((item) => item.id !== itemId)
      );
      showToast("success", "Saved presentation removed.");
    } catch {
      showToast("error", "Could not remove presentation.");
    } finally {
      setLoadingId("");
    }
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingAccount(true);

    if (
      accountForm.newPassword &&
      accountForm.newPassword !== accountForm.confirmPassword
    ) {
      showToast("error", "New password and confirmation do not match.");
      setIsSavingAccount(false);
      return;
    }

    try {
      const response = await fetch("/api/user/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountForm.name,
          email: accountForm.email,
          currentPassword: accountForm.currentPassword,
          newPassword: accountForm.newPassword,
        }),
      });
      const data = (await response.json()) as {
        user?: PublicUser;
        error?: string;
      };

      if (!response.ok || !data.user) {
        showToast("error", data.error ?? "Could not update account.");
        return;
      }

      setCurrentUser(data.user);
      setAccountForm((current) => ({
        ...current,
        name: data.user?.name ?? current.name,
        email: data.user?.email ?? current.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      showToast("success", "Account settings updated.");
      router.refresh();
    } catch {
      showToast("error", "Could not update account.");
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function deleteAccount() {
    setLoadingId("delete-account");

    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: deletePassword }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        showToast("error", data.error ?? "Could not delete account.");
        return;
      }

      router.push("/signup");
      router.refresh();
    } catch {
      showToast("error", "Could not delete account.");
    } finally {
      setLoadingId("");
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={
              toast.type === "success"
                ? "rounded-2xl border border-orange-500/30 bg-orange-500/10 px-5 py-4 text-sm text-orange-100"
                : "rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100"
            }
          >
            <div className="flex items-center justify-between gap-4">
              <span>{toast.message}</span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setToast(null)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="premium-card glow-border rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Clock className="mt-1 size-7 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Download History
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Newest downloads appear first for {currentUser.name}.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {history.length === 0 ? (
            <EmptyState
              title="No downloads yet"
              description="Your PPT and PDF downloads will appear here after you generate a file while logged in."
            />
          ) : (
            history.map((item) => (
              <motion.article
                key={item.id}
                layout
                className="rounded-2xl border border-white/10 bg-black/25 p-4 transition-all hover:border-orange-500/30 hover:bg-orange-500/5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                        {item.format}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        {formatDate(item.downloadedAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className="mt-1 break-all text-sm text-muted-foreground">
                      {item.slideshareUrl}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition-all hover:border-orange-500/40 hover:text-orange-300"
                      >
                        <ExternalLink className="size-4" />
                        Open file
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHistoryItem(item.id)}
                      disabled={loadingId === item.id}
                      aria-label={`Delete download history for ${item.title}`}
                    >
                      {loadingId === item.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

      <section className="premium-card glow-border rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Bookmark className="mt-1 size-7 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Saved Presentations
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bookmark presentations from the live preview section and return to
              them later.
            </p>
          </div>
        </div>

        <div className="mt-6">
          {savedPresentations.length === 0 ? (
            <EmptyState
              title="No saved presentations"
              description="Preview a SlideShare presentation, then click Save Presentation to add it here."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {savedPresentations.map((item) => (
                <motion.article
                  key={item.id}
                  layout
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 transition-all hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_0_45px_-18px_rgba(249,115,22,0.8)]"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-950">
                    <RemoteImage
                      src={item.thumbnailUrl}
                      alt={item.title}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">
                      Saved {formatDate(item.savedAt)}
                    </p>
                    <h3 className="mt-2 line-clamp-2 font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 break-all text-xs text-muted-foreground">
                      {item.slideshareUrl}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={item.slideshareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold transition-all hover:border-orange-500/40 hover:text-orange-300"
                      >
                        <ExternalLink className="size-4" />
                        Open
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSavedPresentation(item.id)}
                        disabled={loadingId === item.id}
                        aria-label={`Remove saved presentation ${item.title}`}
                      >
                        {loadingId === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="premium-card glow-border rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <Settings className="mt-1 size-7 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Account Settings
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Update your profile details and password securely.
            </p>
          </div>
        </div>

        <form onSubmit={saveAccount} className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            Username
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-3.5 size-4 text-orange-400" />
              <input
                className={`${inputClass} pl-10`}
                value={accountForm.name}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
          </label>
          <label className="space-y-2 text-sm font-medium">
            Email
            <input
              type="email"
              className={inputClass}
              value={accountForm.email}
              onChange={(event) =>
                setAccountForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            Current password
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3.5 size-4 text-orange-400" />
              <input
                type="password"
                className={`${inputClass} pl-10`}
                value={accountForm.currentPassword}
                onChange={(event) =>
                  setAccountForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                placeholder="Required to save changes"
              />
            </div>
          </label>
          <label className="space-y-2 text-sm font-medium">
            New password
            <input
              type="password"
              className={inputClass}
              value={accountForm.newPassword}
              onChange={(event) =>
                setAccountForm((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
              placeholder="Leave blank to keep current password"
            />
          </label>
          <label className="space-y-2 text-sm font-medium lg:col-span-2">
            Confirm new password
            <input
              type="password"
              className={inputClass}
              value={accountForm.confirmPassword}
              onChange={(event) =>
                setAccountForm((current) => ({
                  ...current,
                  confirmPassword: event.target.value,
                }))
              }
              placeholder="Repeat new password"
            />
          </label>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
            <Button type="submit" disabled={isSavingAccount}>
              {isSavingAccount ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Settings className="size-5" />
              )}
              Save Account Settings
            </Button>
            <Button type="button" variant="secondary" onClick={logout}>
              <LogOut className="size-5" />
              Logout
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-red-500/30 text-red-200 hover:border-red-500/60 hover:text-red-100"
              onClick={() => setShowDeleteAccountModal(true)}
            >
              <Trash2 className="size-5" />
              Delete Account
            </Button>
          </div>
        </form>
      </section>

      <AnimatePresence>
        {showDeleteAccountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="glass-card glow-border w-full max-w-md rounded-3xl p-6"
            >
              <h3 className="text-xl font-bold">Delete account?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This permanently removes your account, download history, and
                saved presentations. Enter your current password to confirm.
              </p>
              <input
                type="password"
                className={`${inputClass} mt-5`}
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="Current password"
              />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-200 hover:border-red-500/60 hover:text-red-100"
                  onClick={deleteAccount}
                  disabled={loadingId === "delete-account"}
                >
                  {loadingId === "delete-account" ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Trash2 className="size-5" />
                  )}
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowDeleteAccountModal(false);
                    setDeletePassword("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
