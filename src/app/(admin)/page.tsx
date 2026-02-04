import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, Trophy, AlertTriangle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/ui/skeleton";

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

  const [
    totalAthletes,
    activeAthletes,
    competitorAthletes,
    todayAttendance,
    expiredSubscriptions,
    expiringSubscriptions,
    todayClasses,
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
  ]);

  return {
    totalAthletes,
    activeAthletes,
    competitorAthletes,
    todayAttendance,
    expiredSubscriptions,
    expiringSubscriptions,
    todayClasses,
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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground capitalize">{today}</p>
      </div>

      {/* Alert Banner */}
      <AlertBanner expired={stats.expiredSubscriptions} expiring={stats.expiringSubscriptions} />

      {/* Primary Stats - High Priority */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/atletas">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atletas Activos
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.activeAthletes}</div>
              <p className="text-sm text-muted-foreground mt-1">
                de {stats.totalAthletes} registrados
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
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 text-blue-500" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.todayAttendance}</div>
              <p className="text-sm text-muted-foreground mt-1">
                atletas entrenando
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-all hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clases Hoy
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-500" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.todayClasses.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              sesiones programadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats - Info */}
      <div className="grid gap-4 grid-cols-2">
        <Link href="/competencias">
          <Card className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold">{stats.competitorAthletes}</p>
                  <p className="text-xs text-muted-foreground">Competidores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pagos">
          <Card className={`hover:shadow-md transition-all cursor-pointer ${stats.expiredSubscriptions > 0 ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : ""}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${stats.expiredSubscriptions > 0 ? "text-red-500" : "text-muted-foreground"}`} aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold">{stats.expiredSubscriptions}</p>
                  <p className="text-xs text-muted-foreground">Vencidas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Classes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Clases de Hoy</CardTitle>
            <Link
              href="/calendario"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver calendario
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.todayClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No hay clases programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.todayClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/clases/${cls.id}/checkin`}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: cls.color || "#D4AF37" }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{cls.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {cls.startTime} - {cls.endTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {cls._count.attendances}/{cls.maxCapacity}
                    </p>
                    <p className="text-xs text-muted-foreground">asistentes</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
