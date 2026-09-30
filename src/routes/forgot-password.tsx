import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/data/store";
import { useDisplayPreferences } from "@/lib/display-preferences";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Book Swap SA" },
      {
        name: "description",
        content: "Request a secure password reset link for your Book Swap SA account.",
      },
      { property: "og:title", content: "Reset password — Book Swap SA" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useApp();
  const { t } = useDisplayPreferences();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm">
        <h1 className="text-xl font-semibold text-primary-dark">
          {sent ? t("checkYourEmail") : t("resetYourPassword")}
        </h1>

        {sent ? (
          <div className="mt-4 space-y-6">
            <p className="text-sm leading-6 text-muted-foreground">
              {t("resetEmailSent", { email })}
            </p>
            <Button asChild className="w-full rounded-xl">
              <Link to="/login">{t("returnToSignIn")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">{t("enterResetEmail")}</p>

            <form
              className="mt-6 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError(null);
                try {
                  await resetPassword(email);
                  setEmail(email.trim().toLowerCase());
                  setSent(true);
                  toast.success(t("resetEmailRequested"));
                } catch (err) {
                  console.error(err);
                  setError(t("resetEmailFailed"));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("studentEmail")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full rounded-xl" disabled={busy}>
                {busy ? t("sending") : t("sendResetLink")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("rememberedPassword")}{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {t("signIn")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
