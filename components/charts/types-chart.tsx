"use client";

import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  OPN: "#06b6d4",
  DUR: "#3b82f6",
  SEA: "#8b5cf6",
};

interface TypesChartProps {
  data: { name: string; count: number }[];
}

export function TypesChart({ data }: TypesChartProps) {
  const t = useTranslations("types");

  const chartData = data.map((item) => ({
    name: t(item.name as "OPN" | "DUR" | "SEA"),
    value: item.count,
    code: item.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.code as keyof typeof COLORS] || "#8884d8"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
