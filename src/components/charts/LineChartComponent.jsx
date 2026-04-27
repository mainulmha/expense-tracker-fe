import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

export default function LineChartComponent({ data }) {

    // Month name format করার জন্য
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const formattedData = data.map((item) => ({
        ...item,
        monthName: `${monthNames[item._id.month - 1]} ${item._id.year.toString().slice(2)}`, // Jan 26
    }));

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={420}>
                <LineChart
                    data={formattedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                    <XAxis
                        dataKey="monthName"
                        tick={{ fill: '#9ca3af', fontSize: 13 }}
                        axisLine={{ stroke: '#4b5563' }}
                    />

                    <YAxis
                        tick={{ fill: '#9ca3af' }}
                        axisLine={{ stroke: '#4b5563' }}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#1f2937",
                            border: "none",
                            borderRadius: "12px",
                            color: "#fff",
                            padding: "12px"
                        }}
                        formatter={(value, name) => [
                            `৳ ${value.toLocaleString()}`,
                            name === "income" ? "Income" :
                                name === "expense" ? "Expense" : "Investment"
                        ]}
                    />

                    <Legend
                        verticalAlign="top"
                        height={50}
                        iconType="line"
                    />

                    {/* Lines */}
                    <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: "#22c55e", r: 5 }}
                        activeDot={{ r: 7 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expense"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ fill: "#ef4444", r: 5 }}
                        activeDot={{ r: 7 }}
                    />

                    <Line
                        type="monotone"
                        dataKey="investment"
                        name="Investment"
                        stroke="#a855f7"
                        strokeWidth={3}
                        dot={{ fill: "#a855f7", r: 5 }}
                        activeDot={{ r: 7 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}