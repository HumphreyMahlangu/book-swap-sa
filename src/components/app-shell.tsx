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
  Laptop,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { useApp } from "@/lib/data/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDisplayPreferences, type ThemePreference } from "@/lib/display-preferences";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/sell", label: "Sell", icon: PlusCircle },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

const desktopNav = [
  { to: "/home", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/sell", label: "Sell" },
  { to: "/orders", label: "Orders" },
  { to: "/messages", label: "Messages" },
  { to: "/swaps", label: "Swaps" },
  { to: "/profile", label: "Profile" },
  { to: "/help", label: "Help" },
] as const;
void MessageSquare; void Repeat2; void BookOpen; void HelpCircle;

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
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 shadow-soft text-center">
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
        <h1 className="text-3xl font-bold tracking-tight text-primary">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function TopBar() {
  const { user, cart, unreadCount, signOut } = useApp();
  const { theme, setTheme } = useDisplayPreferences();
  const navigate = useNavigate();
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Laptop;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/home" className="flex items-center gap-2">
          <BrandLogo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {desktopNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-primary"
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Choose appearance">
                <ThemeIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as ThemePreference)}
              >
                <DropdownMenuRadioItem value="light"><Sun /> Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark"><Moon /> Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system"><Laptop /> Use device</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            to="/notifications"
            className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-primary-dark"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-card">
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
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-primary ring-2 ring-card">
                {cart.length}
              </span>
            ) : null}
          </Link>
          {user ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={async () => {
                await signOut();
                navigate({ to: "/", replace: true });
              }}
              className="text-muted-foreground hover:bg-secondary hover:text-primary-dark"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          if (item.to === "/sell")
            return (
              <Link key={item.to} to={item.to} aria-label="Sell a textbook" className="flex flex-1 flex-col items-center gap-1 pb-2 text-[11px] font-semibold text-primary">
                <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift ring-4 ring-background">
                  <Icon className="h-6 w-6" />
                </span>
                Sell
              </Link>
            );
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                active ? "text-primary [&_svg]:text-gold" : "text-muted-foreground",
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
      <main className="mx-auto w-full max-w-7xl px-4 py-8 animate-in fade-in duration-200">{children}</main>
      <BottomNav />
    </div>
  );
}
