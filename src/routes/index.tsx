import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Repeat2, ShieldCheck, Wallet } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { DemoBadge, LoadingScreen } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecondHand Textbook Swap — Student Textbook Marketplace" },
      {
        name: "description",
        content:
          "Buy, sell and swap used university textbooks with fellow South African students. Affordable prices, campus collection, no middleman.",
      },
      { property: "og:title", content: "SecondHand Textbook Swap" },
      {
        property: "og:description",
        content: "Student-to-student marketplace for affordable second-hand university textbooks.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { ready, user, signInDemo } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate({ to: "/home", replace: true });
  }, [ready, user, navigate]);

  if (!ready) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold leading-tight text-primary-dark">
              SecondHand
              <br />
              Textbook Swap
            </span>
          </span>
          <DemoBadge />
        </div>

        <section className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-primary-dark sm:text-4xl">
              Textbooks cost less when students trade with students.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Buy, sell or swap your used university textbooks safely on campus. Set your own price,
              chat with the seller, and collect between lectures.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-xl"
                onClick={async () => {
                  try {
                    await signInDemo();
                    toast.success("Signed in as Thabo Mokoena (demo student)");
                    navigate({ to: "/home" });
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                Try the demo
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-xl">
                <Link to="/signup">Create account</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Wallet, title: "Student prices", body: "Save up to 70% against new textbook prices." },
              { icon: Repeat2, title: "Swap instead", body: "Trade last semester's book for this semester's." },
              { icon: ShieldCheck, title: "Campus safe", body: "Meet at agreed campus collection points." },
              { icon: BookOpen, title: "Every module", body: "IT, Business, Accounting, Engineering and more." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <f.icon className="h-6 w-6 text-accent" />
                <h2 className="mt-3 text-sm font-semibold text-primary-dark">{f.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
