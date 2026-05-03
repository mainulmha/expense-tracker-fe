import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";
import { capitalize } from "../../utils/helper";
import { useState, useEffect } from "react";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#14b8a6", "#ef4444"];

export default function PieChartComponent({ data, type = "expense" }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // টাইপ অনুযায়ী ডাটা ফিল্টার ও গ্রুপিং
    const filteredData = data.filter(item => item.type === type);
    const categoryMap = {};
    filteredData.forEach(item => {
        const category = item.category || item._id || "Others";
        const amount = item.amount || item.total || 0;
        categoryMap[category] = (categoryMap[category] || 0) + amount;
    });

    let chartData = Object.keys(categoryMap).map(category => ({
        _id: category,
        name: capitalize(category),
        total: categoryMap[category],
    })).sort((a, b) => b.total - a.total);

    // অনেক ক্যাটাগরি থাকলে গ্রুপিং করা (মবাইলে ৩টি, ডেস্কটপে ৫টি)
    const MAX_ITEMS = isMobile ? 3 : 5;
    if (chartData.length > MAX_ITEMS) {
        const mainItems = chartData.slice(0, MAX_ITEMS - 1);
        const otherTotal = chartData.slice(MAX_ITEMS - 1).reduce((sum, item) => sum + item.total, 0);
        chartData = [...mainItems, { _id: "other", name: "Others", total: otherTotal }];
    }

    const totalAmount = chartData.reduce((sum, entry) => sum + entry.total, 0);
    const formattedData = chartData.map(entry => ({
        ...entry,
        percentage: totalAmount > 0 ? parseFloat(((entry.total / totalAmount) * 100).toFixed(1)) : 0
    }));

    if (!formattedData.length) {
        return <div className="flex items-center justify-center h-full text-[10px] uppercase font-black text-gray-600 tracking-widest">No Data</div>;
    }

    // প্রিমিয়াম কাস্টম লেজেন্ড
    const renderLegendContent = (props) => {
        const { payload } = props;
        return (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                            {entry.value} <span className="text-gray-400 font-medium">{entry.payload.percentage}%</span>
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full min-h-[240px] flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={formattedData}
                        cx="50%"
                        cy="45%" // একটু ওপরে উঠিয়ে দেওয়া হলো লেজেন্ডের জায়গা করার জন্য
                        innerRadius={isMobile ? 45 : 60}
                        outerRadius={isMobile ? 65 : 85}
                        dataKey="total"
                        nameKey="name"
                        paddingAngle={5}
                        stroke="none"
                    >
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}
                        itemStyle={{ color: "#fff" }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend content={renderLegendContent} verticalAlign="bottom" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
