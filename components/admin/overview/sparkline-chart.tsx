"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

export function SparklineChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="count"
            stroke="#DC2626"
            strokeWidth={2}
            fill="url(#sparkline-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
