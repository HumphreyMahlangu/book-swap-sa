import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  GraduationCap,
  MapPin,
  MessageCircle,
  PiggyBank,
  Recycle,
  Search,
  ListChecks,
  Handshake,
  Star,
} from "lucide-react";
import { useEffect } from "react";

import coverBiz from "@/assets/cover-biz.jpg";
import coverDb from "@/assets/cover-db.jpg";
import coverJava from "@/assets/cover-java.jpg";
import { LoadingScreen } from "@/components/app-shell";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/data/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Book Swap SA — Buy, Sell & Swap University Textbooks" },
      {
        name: "description",
        content:
          "Buy, sell and swap second-hand textbooks with fellow South African students — affordable, simple and built for campus life.",
      },
      { property: "og:title", content: "Book Swap SA — Student Textbook Marketplace" },
      {
        property: "og:description",
        content: "Affordable second-hand textbooks from students on your campus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const floating = [
  { img: coverDb, title: "Database Systems", module: "INF 201", price: "R220", tag: "Good Condition", pos: "left-0 top-6", tilt: "-4deg", anim: "animate-float" },
  { img: coverJava, title: "Java Programming", module: "PRG 201", price: "R180", tag: "Swap Available", pos: "right-0 top-32", tilt: "3deg", anim: "animate-float-delayed" },
  { img: coverBiz, title: "Business Management", module: "BMA 201", price: "R150", tag: "Like New", pos: "left-12 bottom-0", tilt: "-2deg", anim: "animate-float-delayed" },
];

const values = [
  { icon: PiggyBank, title: "Save Money", body: "Find textbooks at affordable student-friendly prices." },
  { icon: Recycle, title: "Swap & Reuse", body: "Give your old textbooks a second life." },
  { icon: GraduationCap, title: "Student-to-Student", body: "Connect directly with other students." },
  { icon: MapPin, title: "Campus Friendly", body: "Find books available around your campus." },
];

const steps = [
  { icon: Search, n: "01", title: "Find", body: "Search for the textbook you need." },
  { icon: ListChecks, n: "02", title: "Choose", body: "Compare price, condition and seller." },
  { icon: MessageCircle, n: "03", title: "Connect", body: "Message the seller or request a swap." },
  { icon: Handshake, n: "04", title: "Swap / Buy", body: "Arrange collection and get your textbook." },
];

function Welcome() {
  const { ready, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate({ to: "/home", replace: true });
  }, [ready, user, navigate]);

  if (!ready) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero">
        <div className="pattern-books pointer-events-none absolute inset-0 opacity-[0.05]" />
        <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-olive/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-gold/15 blur-2xl" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-xl text-primary">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="hidden rounded-xl sm:inline-flex">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </header>

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-28 lg:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/60 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Built for South African campuses
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
              Find Your Next <span className="relative whitespace-nowrap">Textbook<span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-gold/70" /></span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Buy, sell and swap textbooks with fellow students — affordable, simple and built for
              campus life.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base shadow-soft">
                <Link to="/login">
                  Browse Textbooks <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-primary/25 bg-card px-6 text-base text-primary">
                <Link to="/signup">Sell a Textbook</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <Star className="h-4 w-4 fill-gold text-gold" /> 4.8
              </span>
              <span>CPUT · UCT · UWC · Stellenbosch · UJ · UP</span>
            </div>
          </div>

          <div className="relative mx-auto hidden h-[440px] w-full max-w-md sm:block" aria-hidden="true">
            {floating.map((c) => (
              <div
                key={c.title}
                className={`card-surface absolute w-60 p-3 ${c.pos} ${c.anim}`}
                style={{ ["--tilt" as string]: c.tilt }}
              >
                <div className="flex gap-3">
                  <img src={c.img} alt="" width={768} height={1024} className="h-20 w-16 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.module}</p>
                    <p className="mt-1 text-lg font-bold text-gold">{c.price}</p>
                    <span className="rounded-full bg-olive/10 px-2 py-0.5 text-[10px] font-semibold text-olive">
                      {c.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold text-primary">Why Students Choose Book Swap SA</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="card-surface hover-lift p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <v.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-primary">{v.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-bold text-primary">How Book Swap SA Works</h2>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-gradient-to-r from-primary/10 via-gold/60 to-primary/10 md:block" />
            {steps.map((s) => (
              <li key={s.n} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold bg-card text-primary shadow-soft">
                  <s.icon className="h-6 w-6" />
                </span>
                <p className="mt-4 text-xs font-bold tracking-widest text-gold">{s.n}</p>
                <h3 className="mt-1 text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mx-auto mt-1 max-w-[14rem] text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground sm:px-16">
          <div className="pattern-books pointer-events-none absolute inset-0 opacity-[0.08] invert" />
          <h2 className="relative text-3xl font-bold">Have textbooks from last semester?</h2>
          <p className="relative mx-auto mt-3 max-w-md opacity-85">
            List them in under a minute and help another student save.
          </p>
          <Button asChild size="lg" className="relative mt-7 h-12 rounded-xl bg-gold px-6 text-base text-primary hover:bg-gold/90">
            <Link to="/signup">Start selling</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground sm:flex-row">
          <BrandLogo />
          <p>© 2026 Book Swap SA · A student project</p>
        </div>
      </footer>
    </div>
  );
}
