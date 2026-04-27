import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function BarChartComponent({ data, title }) {
    if (!data || data.length === 0) {
        return (
            <div className="bg-[#111827] rounded-xl p-6 text-center text-gray-500">
                No data available for chart
            </div>
        );
    }

    return (
        <div className="bg-[#111827] rounded-xl p-4 sm:p-6">
            {title && (
                <h3 className="text-gray-400 text-sm sm:text-base mb-4">{title}</h3>
            )}
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                    <XAxis
                        dataKey="monthName"
                        tick={{
                            fill: '#9ca3af',
                            fontSize: 12
                        }}
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        interval={0}
                        tickLine={false}
                    />

                    <YAxis
                        tick={{ fill: '#9ca3af' }}
                        axisLine={{ stroke: '#4b5563' }}
                        tickFormatter={(value) => `৳${value.toLocaleString()}`}
                    />

                    <Tooltip
                        formatter={(value) => [`৳ ${value.toLocaleString()}`, "Expense"]}
                        contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "10px",
                            color: "#fff",
                            fontSize: "12px"
                        }}
                    />

                    <Bar
                        dataKey="expense"
                        name="Expense"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
