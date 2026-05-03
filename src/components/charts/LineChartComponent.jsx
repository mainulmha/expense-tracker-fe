import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function LineChartComponent({ data }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const formattedData = data.map((item) => ({
        ...item,
        monthName: `${monthNames[item._id.month - 1]}`,
    }));

    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-[10px] uppercase font-black text-gray-600 tracking-widest">No Data Available</div>;
    }

    // Custom Legend Renderer
    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <div className="flex justify-center gap-4 mb-4">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div className="w-3 h-[2px]" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

                    <XAxis
                        dataKey="monthName"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                        dy={10}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid #1e293b",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "bold",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                        }}
                        formatter={(value) => [`৳ ${value.toLocaleString()}`]}
                    />

                    <Legend content={renderLegend} verticalAlign="top" align="center" />

                    <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#020617" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expense"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#020617" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="investment"
                        name="Investment"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#020617" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
