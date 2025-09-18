import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Clock, Compass, ListChecks, MapPin, Sparkles, Users } from "lucide-react";

import { prisma } from "@/lib/database";
import { BOOKING_STATUS } from "@/lib/constants";
import { calculateJobPayment, formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getWorker(workerId?: string) {
  const worker = await prisma.workerProfile.findFirst({
    where: workerId ? { id: workerId } : undefined,
    include: {
      user: true,
      availability: true,
      bookings: {
        include: {
          job: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: workerId ? undefined : { createdAt: "asc" },
  });

  return worker;
}

type WorkerPageProps = {
  searchParams?: Record<string, string | string[]>;
};

export default async function WorkerDashboard({ searchParams }: WorkerPageProps) {
  const workerId = typeof searchParams?.workerId === "string" ? searchParams.workerId : undefined;
  const worker = await getWorker(workerId);

  if (!worker) {
    notFound();
  }

  const now = new Date();
  const invitations = worker.bookings.filter((booking) => booking.status === BOOKING_STATUS.OFFERED);
  const upcoming = worker.bookings.filter(
    (booking) =>
      booking.status === BOOKING_STATUS.ACCEPTED &&
      booking.job.start.getTime() > now.getTime()
  );
  const completed = worker.bookings.filter((booking) => booking.status === BOOKING_STATUS.COMPLETED);
  const totalEarned = completed.reduce(
    (sum, booking) => sum + calculateJobPayment(booking.job.rate, booking.job.start, booking.job.end),
    0
  );
  const availabilityHours = worker.availability.reduce((sum, slot) => {
    const hours = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60 * 60);
    return sum + Math.max(0, hours);
  }, 0);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-white/10 text-white">
              Worker workspace
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">
                Welcome back{worker.user?.name ? `, ${worker.user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200/80">
                Complete your profile, keep availability up to date, and respond quickly to invitations to land more paid gigs.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/worker/profile">Update profile</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link href="/worker/matches">View matches</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left md:w-80">
            <Card className="border-white/20 bg-white/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-slate-200/70">
                  Upcoming jobs
                </CardDescription>
                <CardTitle className="text-3xl text-white">{upcoming.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-white/20 bg-white/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-slate-200/70">
                  Invitations
                </CardDescription>
                <CardTitle className="text-3xl text-white">{invitations.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-white/20 bg-white/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-slate-200/70">
                  Completed gigs
                </CardDescription>
                <CardTitle className="text-3xl text-white">{completed.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-white/20 bg-white/5">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide text-slate-200/70">
                  Lifetime earnings
                </CardDescription>
                <CardTitle className="text-3xl text-white">{formatCurrency(totalEarned)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete onboarding</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Keep your skills, rates, and travel radius up to date to appear in the best matches.
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href="/worker/profile">Review profile</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You currently have {worker.availability.length} active slot{worker.availability.length === 1 ? "" : "s"} covering
              {" "}
              {availabilityHours.toFixed(0)} hours.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/worker/availability">Manage availability</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {invitations.length ? `You have ${invitations.length} pending invitation${invitations.length === 1 ? "" : "s"}.` : "No pending invites. We’ll notify you when new opportunities arrive."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/worker/matches">Respond now</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track confirmations, event details, and payout history in one place.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/worker/bookings">View bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="invitations" className="space-y-4">
          {invitations.length ? (
            invitations.slice(0, 4).map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="text-base">{booking.job.title}</CardTitle>
                  <CardDescription>
                    {formatDateTime(booking.job.start)} · {booking.job.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {booking.job.neededRoles.join(", ")} @ {formatCurrency(booking.job.rate, false)}/hr
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/worker/matches">Respond</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground">
                No invitations yet. Keep availability current to receive offers faster.
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          {upcoming.length ? (
            upcoming.slice(0, 4).map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle className="text-base">{booking.job.title}</CardTitle>
                  <CardDescription>
                    {formatDateTime(booking.job.start)} → {formatDateTime(booking.job.end)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {booking.job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    {booking.job.neededRoles.join(", ")}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[160px] items-center justify-center text-sm text-muted-foreground">
                Confirmed bookings will appear here once you accept an invitation.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
