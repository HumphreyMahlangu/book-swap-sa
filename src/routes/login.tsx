import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import { useApp } from "@/lib/data/store";
import { useDisplayPreferences } from "@/lib/display-preferences";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Book Swap SA" },
      {
        name: "description",
        content: "Sign in with your student email to buy, sell and swap textbooks.",
      },
      { property: "og:title", content: "Sign in — Book Swap SA" },
      {
        property: "og:description",
        content: "Sign in to your student textbook marketplace account.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useApp();
  const { t } = useDisplayPreferences();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm">
        <h1 className="text-xl font-semibold text-primary-dark">{t("welcomeBack")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("signInWithStudentEmail")}</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            try {
              await signIn(email, password);
              toast.success(t("signedIn"));
              navigate({ to: "/home" });
            } catch (err) {
              setError((err as Error).message);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="password">{t("password")}</Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
            {busy ? t("signingIn") : t("signIn")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("newHere")}{" "}
          <Link
            to="/signup"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("createAnAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}
