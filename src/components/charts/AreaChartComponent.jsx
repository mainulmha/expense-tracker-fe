import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AreaChartComponent({ data }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Format data
    const formattedData = data.map((item) => ({
        monthName: `${monthNames[item._id.month - 1]} ${item._id.year.toString().slice(2)}`,
        income: item.income || 0,
        expense: item.expense || 0,
        investment: item.investment || 0,
    }));

    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-500">No monthly data available</div>;
    }

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={isMobile ? 340 : 420}>
                <AreaChart data={formattedData} margin={{ top: 15, right: 20, left: 10, bottom: isMobile ? 50 : 60 }}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.85} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.08} />
                        </linearGradient>
                        <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                    <XAxis
                        dataKey="monthName"
                        tick={{ fill: '#9ca3af', fontSize: isMobile ? 10 : 12 }}
                        angle={isMobile ? -45 : -35}
                        textAnchor="end"
                        height={isMobile ? 55 : 70}
                        interval={0}
                    />

                    <YAxis
                        tick={{ fill: '#9ca3af', fontSize: isMobile ? 10 : 12 }}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: isMobile ? 12 : 14
                        }}
                    />

                    {/* <Legend verticalAlign="top" height={40} contentStyle={{ fontSize: 14 }} /> */}

                    <Area
                        type="natural"
                        dataKey="income"
                        name="Income"
                        stroke="#22c55e"
                        fill="url(#colorIncome)"
                        strokeWidth={3}
                    />
                    <Area
                        type="natural"
                        dataKey="expense"
                        name="Expense"
                        stroke="#ef4444"
                        fill="url(#colorExpense)"
                        strokeWidth={3}
                    />
                    <Area
                        type="natural"
                        dataKey="investment"
                        name="Investment"
                        stroke="#a855f7"
                        fill="url(#colorInvestment)"
                        strokeWidth={2.5}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
