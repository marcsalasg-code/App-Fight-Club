import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CalendarCheck, Trophy, AlertTriangle, Clock, AlertCircle, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { NextClassCard } from "@/components/dashboard/next-class-card";

export const dynamic = 'force-dynamic';

const DAYS_MAP: Record<number, string> = {
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
  0: "SUNDAY",
};

async function getDashboardStats() {
  const now = new Date();
  const todayDayOfWeek = DAYS_MAP[now.getDay()];
  const sevenDaysAgo = subDays(now, 6);

  const [
    totalAthletes,
    activeAthletes,
    competitorAthletes,
    todayAttendance,
    expiredSubscriptions,
    expiringSubscriptions,
    todayClasses,
    weeklyAttendanceRaw
  ] = await Promise.all([
    prisma.athlete.count(),
    prisma.athlete.count({ where: { status: "ACTIVE" } }),
    prisma.athlete.count({ where: { isCompetitor: true } }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.subscription.count({ where: { status: "EXPIRED" } }),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
        endDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.class.findMany({
      where: { dayOfWeek: todayDayOfWeek, active: true },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        color: true,
        maxCapacity: true,
        _count: { select: { attendances: true } },
      },
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        date: true,
      },
    }),
  ]);

  // If no classes today, find the next active day (single query)
  let displayClasses = todayClasses;
  let displayDate = "Hoy";

  if (todayClasses.length === 0) {
    // Get all active classes grouped by day in one query
    const allActiveClasses = await prisma.class.findMany({
      where: { active: true },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        color: true,
        maxCapacity: true,
        dayOfWeek: true,
        _count: { select: { attendances: true } },
      },
    });

    // Find the nearest future day with classes
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(now.getDate() + i);
      const dayOfWeek = DAYS_MAP[nextDate.getDay()];

      const nextClasses = allActiveClasses.filter(c => c.dayOfWeek === dayOfWeek);
      if (nextClasses.length > 0) {
        displayClasses = nextClasses;
        const dayName = format(nextDate, "EEEE", { locale: es });
        displayDate = `Próximas: ${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
        break;
      }
    }
  }

  // Determine "Next Class"
  let nextClass = null;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  // 1. Check classes remaining today
  const upcomingToday = todayClasses.filter(c => {
    const [h, m] = c.startTime.split(':').map(Number);
    return (h * 60 + m) >= currentTimeVal - 30; // Show if started less than 30 mins ago
  });

  if (upcomingToday.length > 0) {
    nextClass = { ...upcomingToday[0], attendancesCount: upcomingToday[0]._count.attendances };
  } else if (displayClasses !== todayClasses && displayClasses.length > 0) {
    // 2. If no more today, show first of next valid day
    const firstNext = displayClasses[0];
    // We need to map the _count structure flat
    nextClass = { ...firstNext, attendancesCount: firstNext._count.attendances };
  }


  // Process weekly attendance
  const weeklyActivity = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(now, 6 - i);
    const dayName = format(d, "EEE", { locale: es }); // Lun, Mar, etc.
    // Capitalize first letter
    const dayLabel = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    const count = weeklyAttendanceRaw.filter(a =>
      new Date(a.date).toDateString() === d.toDateString()
    ).length;

    return {
      day: dayLabel,
      attendance: count
    };
  });

  return {
    totalAthletes,
    activeAthletes,
    competitorAthletes,
    todayAttendance,
    expiredSubscriptions,
    expiringSubscriptions,
    displayClasses,
    displayDate,
    weeklyActivity,
    nextClass,
  };
}

function AlertBanner({ expired, expiring }: { expired: number; expiring: number }) {
  const total = expired + expiring;
  if (total === 0) return null;

  return (
    <Link href="/pagos" className="block">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-amber-600" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Atención requerida
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {expired > 0 && `${expired} suscripciones vencidas`}
            {expired > 0 && expiring > 0 && " • "}
            {expiring > 0 && `${expiring} por vencer esta semana`}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const stats = await getDashboardStats();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: es });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
      </div>

      {/* Quick Actions - New Feature */}
      <QuickActions />

      {/* Primary Stats - Adjusted Layout */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/atletas">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atletas Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold stat-number">{stats.activeAthletes}</div>
              <p className="text-xs text-muted-foreground">
                + {stats.totalAthletes} registrados
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/calendario">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Check-ins Hoy
              </CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold stat-number">{stats.todayAttendance}</div>
              <p className="text-xs text-muted-foreground">
                atletas entrenando
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/competencias">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Competidores
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold stat-number">{stats.competitorAthletes}</div>
              <p className="text-xs text-muted-foreground">
                en equipo oficial
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pagos">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertas Pago
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold stat-number">{stats.expiredSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                suscripciones vencidas
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alert Banner */}
      <AlertBanner expired={stats.expiredSubscriptions} expiring={stats.expiringSubscriptions} />

      {/* Main Content Grid: Next Class & Charts */}
      <div className="grid gap-6 md:grid-cols-7">

        {/* Left Column: Next Class & Today's Schedule */}
        <div className="md:col-span-4 space-y-6">
          {/* Next Class Highlight - New Feature */}
          <div className="h-auto">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Próxima Sesión</CardTitle>
            </CardHeader>
            <NextClassCard nextClass={stats.nextClass} />
          </div>

          <Card className="w-full border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {stats.displayDate === "Hoy" ? "Resto del día" : stats.displayDate}
                </CardTitle>
              </div>
              <Link href="/calendario">
                <Button variant="outline" size="sm" className="gap-2 bg-background">
                  Ver Calendario
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats.displayClasses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No hay más clases programadas</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {stats.displayClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/clases/${cls.id}/checkin`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-card border hover:border-primary/50 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color || "#D4AF37" }} />
                        <div>
                          <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{cls.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{cls.startTime} - {cls.endTime}</span>
                            <span>•</span>
                            <span>{cls._count.attendances} / {cls.maxCapacity}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5 hidden sm:block" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analytics */}
        <div className="md:col-span-3">
          <WeeklyActivityChart data={stats.weeklyActivity} />
        </div>

      </div>
    </div>
  );
}

