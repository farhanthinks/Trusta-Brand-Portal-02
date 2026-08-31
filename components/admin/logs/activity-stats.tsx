import { Activity, CalendarClock, Users2, Clock } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { formatDate } from "@/lib/format";

export function ActivityStats({
  totalEvents,
  eventsToday,
  userCount,
  memberSince,
}: {
  totalEvents: number;
  eventsToday: number;
  userCount: number;
  memberSince: string;
}) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard icon={Activity} label="Total" count={totalEvents} description="All-time events" />
      <StatCard icon={CalendarClock} label="Today" count={eventsToday} description="Events today" />
      <StatCard icon={Users2} label="Users" count={userCount} description="Linked account" />
      <StatCard icon={Clock} label="Since" count={formatDate(memberSince)} description="Member since" />
    </div>
  );
}
