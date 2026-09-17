import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Home,
  LogOut,
  MessageSquare,
  Repeat2,
  Search,
  ShoppingCart,
  User as UserIcon,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useApp } from "@/lib/data/store";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/sell", label: "Sell", icon: PlusCircle },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

const desktopExtra = [
  { to: "/swaps", label: "Swaps", icon: Repeat2 },
  { to: "/orders", label: "Orders", icon: BookOpen },
  { to: "/help", label: "Help", icon: HelpCircle },
] as const;

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-light border-t-primary" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary-dark">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function TopBar() {
  const { user, cart, unreadCount, signOut } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/home" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="hidden text-sm font-semibold leading-tight text-primary-dark sm:block">
            SecondHand
            <br />
            Textbook Swap
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {[...navItems, ...desktopExtra].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-primary-dark"
              activeProps={{ className: "bg-secondary text-primary-dark" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-primary-dark"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {unreadCount}
              </span>
            ) : null}
          </Link>
          <Link
            to="/cart"
            className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-primary-dark"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {cart.length}
              </span>
            ) : null}
          </Link>
          {user ? (
            <button
              type="button"
              aria-label="Sign out"
              onClick={async () => {
                await signOut();
                navigate({ to: "/", replace: true });
              }}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-primary-dark"
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  requireAuth = true,
}: {
  children: ReactNode;
  requireAuth?: boolean;
}) {
  const { ready, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && ready && !user) navigate({ to: "/", replace: true });
  }, [ready, user, requireAuth, navigate]);

  if (!ready) return <LoadingScreen label="Preparing your marketplace…" />;
  if (requireAuth && !user) return <LoadingScreen label="Redirecting to sign in…" />;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}
