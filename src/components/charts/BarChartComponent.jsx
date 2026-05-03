import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell } from "recharts";

export default function BarChartComponent({ data, title }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-[10px] uppercase font-black text-gray-600 tracking-widest">
                No Data available
            </div>
        );
    }

    // গ্র্যাডিয়েন্ট বা মাল্টি-কালার ইফেক্টের জন্য কালার অ্যারে (ঐচ্ছিক)
    const COLORS = ["#ef4444", "#f87171", "#dc2626", "#b91c1c"];

    return (
        <div className="w-full h-full min-h-[240px] flex flex-col">
            {title && (
                <div className="mb-4 px-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</h3>
                </div>
            )}

            <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
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
                            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                        />

                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.4 }}
                            formatter={(value) => [`৳ ${value.toLocaleString()}`, "Expense"]}
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid #1e293b",
                                borderRadius: "12px",
                                color: "#fff",
                                fontSize: "11px",
                                fontWeight: "bold",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                            }}
                        />

                        <Bar
                            dataKey="expense"
                            name="Expense"
                            radius={[6, 6, 0, 0]}
                            barSize={30}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.expense > 0 ? "#ef4444" : "#374151"}
                                    fillOpacity={0.8}
                                    className="hover:fill-opacity-100 transition-all duration-300"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
