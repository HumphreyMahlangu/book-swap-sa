import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAMPUSES } from "@/lib/data/types";
import { useApp } from "@/lib/data/store";
import { useDisplayPreferences } from "@/lib/display-preferences";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Book Swap SA" },
      {
        name: "description",
        content:
          "Register with your student email to list, buy and swap second-hand textbooks on campus.",
      },
      { property: "og:title", content: "Create account — Book Swap SA" },
      { property: "og:description", content: "Join the student textbook marketplace." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp } = useApp();
  const { t } = useDisplayPreferences();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    studentNumber: "",
    email: "",
    institution: "Cape Peninsula University of Technology",
    campus: CAMPUSES[0]!,
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-sm">
        <h1 className="text-xl font-semibold text-primary-dark">{t("createStudentAccount")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("lessThanMinute")}</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (form.password.length < 6) {
              setError(t("passwordTooShort"));
              return;
            }
            if (form.password !== confirmPassword) {
              setError(t("passwordsDoNotMatch"));
              return;
            }
            setBusy(true);
            setError(null);
            try {
              await signUp(form);
              toast.success(t("accountCreated"));
              navigate({ to: "/home" });
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="studentNumber">{t("studentNumber")}</Label>
            <Input
              id="studentNumber"
              value={form.studentNumber}
              onChange={(e) => set("studentNumber", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("studentEmail")}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="institution">{t("institution")}</Label>
            <Input
              id="institution"
              value={form.institution}
              onChange={(e) => set("institution", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("campus")}</Label>
            <Select value={form.campus} onValueChange={(v) => set("campus", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMPUSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {busy ? t("creatingAccount") : t("createAccount")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("alreadyRegistered")}{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
