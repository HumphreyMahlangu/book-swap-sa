import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Calendar,
  Check,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Repeat2,
  ShieldCheck,
  ShoppingBag,
  Star,
  User as UserIcon,
  Languages,
  Laptop,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/data/store";
import { CAMPUSES } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import {
  SOUTH_AFRICAN_LANGUAGES,
  useDisplayPreferences,
  type LanguageCode,
  type ThemePreference,
} from "@/lib/display-preferences";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — Book Swap SA" },
      {
        name: "description",
        content:
          "Manage your student profile, campus location, listings, and notification preferences.",
      },
      { property: "og:title", content: "Student Profile — Book Swap SA" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
});

function ProfilePage() {
  const { user, data, sellerStats, updateProfile, updatePrefs, signOut } = useApp();
  const { theme, language, setTheme, setLanguage, t } = useDisplayPreferences();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [studentNumber, setStudentNumber] = useState(user?.studentNumber ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");
  const [campus, setCampus] = useState(user?.campus ?? CAMPUSES[0]!);
  const [bio, setBio] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const stats = sellerStats(user.id);
  const myReviews = data.reviews.filter((r) => r.sellerId === user.id);
  const myOrdersCount = data.orders.filter((o) => o.buyerId === user.id).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        fullName,
        studentNumber,
        institution,
        campus,
        bio,
      });
      toast.success(t("profileUpdated"));
      setIsEditing(false);
    } catch {
      toast.error(t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePref = async (
    key: "orders" | "messages" | "swaps" | "marketing",
    value: boolean,
  ) => {
    try {
      await updatePrefs({ [key]: value });
      toast.success(t("preferenceSaved"));
    } catch {
      toast.error(t("preferenceSaveFailed"));
    }
  };

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageHeader
        title={t("studentProfile")}
        subtitle={t("profileSubtitle")}
        action={
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setFullName(user.fullName);
              setStudentNumber(user.studentNumber);
              setInstitution(user.institution);
              setCampus(user.campus);
              setBio(user.bio ?? "");
              setIsEditing(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" /> {t("editProfile")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Main User Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-sm">
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-primary-dark">{user.fullName}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t("verifiedStudent")}
                  </span>
                </div>

                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" /> {user.institution}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-accent" /> {user.campus}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {t("joined")}{" "}
                    {new Date(user.memberSince).toLocaleDateString(`${language}-ZA`, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>

                {user.bio && (
                  <p className="mt-3 text-sm text-foreground/90 leading-relaxed bg-secondary/40 p-3 rounded-xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 sm:grid-cols-4">
              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">{t("activeBooks")}</p>
                <p className="mt-1 text-xl font-bold text-primary-dark">{stats.active}</p>
                <Link
                  to="/listings"
                  className="mt-1 text-[11px] text-primary hover:underline font-medium block"
                >
                  {t("viewListings")}
                </Link>
              </div>

              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">{t("textbooksSold")}</p>
                <p className="mt-1 text-xl font-bold text-primary-dark">{stats.sold}</p>
                <span className="text-[11px] text-muted-foreground block">{t("campusSales")}</span>
              </div>

              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">{t("swapsMade")}</p>
                <p className="mt-1 text-xl font-bold text-primary-dark">{stats.swapped}</p>
                <Link
                  to="/swaps"
                  className="mt-1 text-[11px] text-primary hover:underline font-medium block"
                >
                  {t("viewSwaps")}
                </Link>
              </div>

              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">{t("sellerRating")}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-primary-dark">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {stats.rating ? stats.rating.toFixed(1) : t("new")}
                </p>
                <span className="text-[11px] text-muted-foreground block">
                  {t("reviewsCount", { count: stats.reviewCount })}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Received Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-primary-dark">
                  {t("reviewsFromStudents")}
                </h3>
                <p className="text-xs text-muted-foreground">{t("reviewsDescription")}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary-dark">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {stats.rating ? `${stats.rating.toFixed(1)} / 5.0` : t("noRatingsYet")}
              </span>
            </div>

            {myReviews.length === 0 ? (
              <p className="mt-4 text-xs italic text-muted-foreground">{t("noReviewsYet")}</p>
            ) : (
              <div className="mt-4 space-y-3">
                {myReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-border/70 bg-background/50 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-primary-dark">{rev.authorName}</span>
                      <div className="flex items-center gap-0.5 text-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < rev.rating ? "fill-accent" : "text-border fill-transparent",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 text-foreground leading-relaxed">"{rev.comment}"</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(rev.at).toLocaleDateString(`${language}-ZA`, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Preferences & Account Settings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary dark:hidden" />
              <Moon className="hidden h-4 w-4 text-gold dark:block" />
              <h3 className="text-sm font-semibold text-primary-dark">{t("displayAndLanguage")}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("displayDescription")}</p>

            <div className="mt-4 space-y-4">
              <fieldset>
                <legend className="text-xs font-medium text-foreground">{t("appearance")}</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { value: "light" as const, label: t("light"), icon: Sun },
                    { value: "dark" as const, label: t("dark"), icon: Moon },
                    { value: "system" as const, label: t("device"), icon: Laptop },
                  ].map((option) => {
                    const Icon = option.icon;
                    const selected = theme === option.value;
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selected ? "default" : "outline"}
                        className="h-auto min-w-0 flex-col gap-1 rounded-lg px-2 py-2.5 text-xs"
                        aria-pressed={selected}
                        onClick={() => setTheme(option.value as ThemePreference)}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <Label htmlFor="language" className="flex items-center gap-1.5 text-xs font-medium">
                  <Languages className="h-3.5 w-3.5" /> {t("preferredLanguage")}
                </Label>
                <Select
                  value={language}
                  onValueChange={(value) => setLanguage(value as LanguageCode)}
                >
                  <SelectTrigger id="language" className="mt-2 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUTH_AFRICAN_LANGUAGES.map((option) => (
                      <SelectItem key={option.code} value={option.code}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-[11px] text-muted-foreground">{t("translationReady")}</p>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary-dark">{t("notificationAlerts")}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t("notificationDescription")}</p>

            <div className="mt-4 space-y-3">
              {[
                {
                  key: "orders" as const,
                  label: t("textbookOrders"),
                  desc: t("textbookOrderUpdates"),
                },
                {
                  key: "messages" as const,
                  label: t("chatMessages"),
                  desc: t("campusDirectMessages"),
                },
                {
                  key: "swaps" as const,
                  label: t("swapProposals"),
                  desc: t("tradeTextbooks"),
                },
                {
                  key: "marketing" as const,
                  label: t("campusAnnouncements"),
                  desc: t("examTips"),
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="text-xs font-medium text-primary-dark">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={user.notificationPrefs[item.key]}
                    onCheckedChange={(checked) => handleTogglePref(item.key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Student Account Details */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm text-xs space-y-3">
            <h3 className="text-sm font-semibold text-primary-dark">{t("accountDetails")}</h3>
            <div>
              <p className="text-muted-foreground">{t("studentEmailTitle")}</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("studentNumberTitle")}</p>
              <p className="font-medium text-foreground">{user.studentNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("primaryCampus")}</p>
              <p className="font-medium text-foreground">{user.campus}</p>
            </div>

            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                className="w-full rounded-xl text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                {t("signOutOfApp")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary-dark">
              {t("editStudentProfile")}
            </DialogTitle>
            <DialogDescription>{t("profileDialogDescription")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="full-name" className="text-xs font-semibold text-muted-foreground">
                {t("fullNameTitle")}
              </Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 rounded-xl"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="student-number"
                className="text-xs font-semibold text-muted-foreground"
              >
                {t("studentNumberTitle")}
              </Label>
              <Input
                id="student-number"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                className="mt-1 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="institution" className="text-xs font-semibold text-muted-foreground">
                {t("institutionUniversity")}
              </Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1 rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="campus" className="text-xs font-semibold text-muted-foreground">
                {t("campusLocation")}
              </Label>
              <Select value={campus} onValueChange={(val) => setCampus(val)}>
                <SelectTrigger id="campus" className="mt-1 rounded-xl">
                  <SelectValue placeholder={t("selectCampus")} />
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

            <div>
              <Label htmlFor="bio" className="text-xs font-semibold text-muted-foreground">
                {t("bioStudiesNote")}
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("bioPlaceholder")}
                className="mt-1 rounded-xl"
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsEditing(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                {saving ? t("saving") : t("saveChanges")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
