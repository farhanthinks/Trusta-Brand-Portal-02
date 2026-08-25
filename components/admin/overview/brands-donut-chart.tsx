"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = {
  approved: "#16a34a",
  pending: "#DC2626",
  rejected: "#94a3b8",
};

export function BrandsDonutChart({
  approved,
  pending,
  rejected,
}: {
  approved: number;
  pending: number;
  rejected: number;
}) {
  const total = approved + pending + rejected;
  const data = [
    { name: "Approved", value: approved, color: COLORS.approved },
    { name: "Pending", value: pending, color: COLORS.pending },
    { name: "Rejected", value: rejected, color: COLORS.rejected },
  ].filter((d) => d.value > 0);

  return (
    <div className="relative h-24 w-24 shrink-0">
      {total === 0 ? (
        <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-dashed border-muted text-xs text-muted-foreground">
          no data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={28}
              outerRadius={44}
              paddingAngle={data.length > 1 ? 3 : 0}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{total}</span>
      </div>
    </div>
  );
}
