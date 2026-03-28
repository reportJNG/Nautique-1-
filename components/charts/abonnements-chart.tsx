"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
interface AbonnementsChartProps {
    data: {
        name: string;
        count: number;
    }[];
}
export function AbonnementsChart({ data }: AbonnementsChartProps) {
    return (<ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
        <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={80}/>
        <YAxis tick={{ fill: "#6b7280", fontSize: 12 }}/>
        <Tooltip contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
        }}/>
        <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]}/>
      </BarChart>
    </ResponsiveContainer>);
}
