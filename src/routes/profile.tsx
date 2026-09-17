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

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Student Profile — SecondHand Textbook Swap" },
      {
        name: "description",
        content:
          "Manage your student profile, campus location, listings, and notification preferences.",
      },
      { property: "og:title", content: "Student Profile — SecondHand Textbook Swap" },
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
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update profile");
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
      toast.success("Preference saved");
    } catch {
      toast.error("Failed to update preferences");
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
        title="Student Profile"
        subtitle="Manage your campus account details, reputation, and preferences."
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
            <Pencil className="mr-2 h-4 w-4" /> Edit profile
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
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Student
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
                    <Calendar className="h-3.5 w-3.5" /> Joined{" "}
                    {new Date(user.memberSince).toLocaleDateString("en-ZA", {
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
                <p className="text-xs text-muted-foreground">Active Books</p>
                <p className="mt-1 text-xl font-bold text-primary-dark">{stats.active}</p>
                <Link
                  to="/listings"
                  className="mt-1 text-[11px] text-primary hover:underline font-medium block"
                >
                  View listings →
                </Link>
              </div>

              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">Textbooks Sold</p>
                <p className="mt-1 text-xl font-bold text-primary-dark">{stats.sold}</p>
                <span className="text-[11px] text-muted-foreground block">Campus sales</span>
              </div>

              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">Swaps Made</p>
                <p className="mt-1 text-xl font-bold text-primary-dark">{stats.swapped}</p>
                <Link
                  to="/swaps"
                  className="mt-1 text-[11px] text-primary hover:underline font-medium block"
                >
                  View swaps →
                </Link>
              </div>

              <div className="rounded-xl bg-background/60 p-3 text-center border border-border/70">
                <p className="text-xs text-muted-foreground">Seller Rating</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xl font-bold text-primary-dark">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {stats.rating ? stats.rating.toFixed(1) : "New"}
                </p>
                <span className="text-[11px] text-muted-foreground block">
                  {stats.reviewCount} review{stats.reviewCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews Received Section */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-primary-dark">
                  Reviews from Fellow Students
                </h3>
                <p className="text-xs text-muted-foreground">
                  Feedback left after textbook purchases and collections.
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary-dark">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                {stats.rating ? `${stats.rating.toFixed(1)} / 5.0` : "No ratings yet"}
              </span>
            </div>

            {myReviews.length === 0 ? (
              <p className="mt-4 text-xs italic text-muted-foreground">
                No reviews yet. Complete your first textbook sale or swap to start building your
                campus reputation.
              </p>
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
                      {new Date(rev.at).toLocaleDateString("en-ZA", {
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
          {/* Notification Preferences */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary-dark">Notification Alerts</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose what notifications you want to receive on campus.
            </p>

            <div className="mt-4 space-y-3">
              {[
                {
                  key: "orders" as const,
                  label: "Textbook orders",
                  desc: "Updates when textbooks are bought or collected",
                },
                {
                  key: "messages" as const,
                  label: "Chat messages",
                  desc: "Direct messages from students on campus",
                },
                {
                  key: "swaps" as const,
                  label: "Swap proposals",
                  desc: "When someone wants to trade textbooks",
                },
                {
                  key: "marketing" as const,
                  label: "Campus announcements",
                  desc: "Exam season tips and book drives",
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
            <h3 className="text-sm font-semibold text-primary-dark">Account Details</h3>
            <div>
              <p className="text-muted-foreground">Student Email</p>
              <p className="font-medium text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Student Number</p>
              <p className="font-medium text-foreground">{user.studentNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Primary Campus</p>
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
                Sign out of Book Swap SA
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
              Edit Student Profile
            </DialogTitle>
            <DialogDescription>
              Keep your campus and contact details up to date for smooth textbook handovers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="full-name" className="text-xs font-semibold text-muted-foreground">
                Full Name
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
                Student Number
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
                Institution / University
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
                Campus Location
              </Label>
              <Select value={campus} onValueChange={(val) => setCampus(val)}>
                <SelectTrigger id="campus" className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select campus..." />
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
                Bio / Studies Note
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. 2nd Year Mechanical Engineering, willing to meet around student centre."
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
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
