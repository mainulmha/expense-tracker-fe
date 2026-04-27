import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";
import { capitalize } from "../../utils/helper";
import { useState, useEffect } from "react";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6", "#ec4899", "#3b82f6", "#14b8a6", "#f43f5e", "#84cc16", "#a855f7"];

export default function PieChartComponent({ data, type = "expense" }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 640 && window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // টাইপ অনুযায়ী ডাটা ফিল্টার করা
    const filteredData = data.filter(item => item.type === type);

    // ক্যাটাগরি অনুযায়ী গ্রুপ করা
    const categoryMap = {};
    filteredData.forEach(item => {
        const category = item.category || item._id || "Others";
        const amount = item.amount || item.total || 0;
        if (categoryMap[category]) {
            categoryMap[category] += amount;
        } else {
            categoryMap[category] = amount;
        }
    });

    let chartData = Object.keys(categoryMap).map(category => ({
        _id: category,
        name: capitalize(category),
        total: categoryMap[category],
    }));

    // সাজানো (বড় থেকে ছোট)
    chartData.sort((a, b) => b.total - a.total);

    // অনেক ক্যাটাগরি থাকলে "Others" এ গ্রুপ করা
    const MAX_ITEMS = isMobile ? 4 : isTablet ? 5 : 6;

    if (chartData.length > MAX_ITEMS) {
        const mainItems = chartData.slice(0, MAX_ITEMS - 1);
        const otherItems = chartData.slice(MAX_ITEMS - 1);
        const otherTotal = otherItems.reduce((sum, item) => sum + item.total, 0);

        chartData = [
            ...mainItems,
            { _id: "other", name: "Others", total: otherTotal }
        ];
    }

    const totalAmount = chartData.reduce((sum, entry) => sum + (entry.total || 0), 0);

    const formattedData = chartData.map((entry) => {
        const percentage = totalAmount > 0
            ? ((entry.total / totalAmount) * 100).toFixed(1)
            : 0;

        return {
            ...entry,
            name: capitalize(entry._id || "Others"),
            percentage: parseFloat(percentage),
        };
    });

    if (!formattedData || formattedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">
                No {type} data available
            </div>
        );
    }

    // কাস্টম লেজেন্ড রেন্ডারার
    const renderLegendContent = (props) => {
        const { payload } = props;

        if (!payload || payload.length === 0) return null;

        if (isMobile && payload.length > 4) {
            const visibleItems = payload.slice(0, 4);
            return (
                <div className="text-center text-xs text-gray-400 mt-2">
                    {visibleItems.map((entry, index) => (
                        <span key={index} className="inline-block mx-1">
                            {entry.value}: {entry.payload.percentage}%
                        </span>
                    ))}
                    {payload.length > 4 && (
                        <span className="inline-block mx-1 text-green-400">
                            +{payload.length - 4} more
                        </span>
                    )}
                </div>
            );
        }

        return (
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-300">
                            {entry.value} ({entry.payload.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
                    <PieChart>
                        <Pie
                            data={formattedData}
                            cx="50%"
                            cy="50%"
                            innerRadius={isMobile ? 40 : 55}
                            outerRadius={isMobile ? 70 : 100}
                            dataKey="total"
                            nameKey="name"
                            label={!isMobile ? ({ percentage }) => `${percentage}%` : false}
                            labelLine={false}
                            paddingAngle={2}
                        >
                            {formattedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#1f2937"
                                    strokeWidth={1}
                                />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value, name) => [`৳ ${value.toLocaleString()}`, name]}
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "none",
                                borderRadius: "8px",
                                color: "#fff",
                                fontSize: "12px",
                                padding: "6px 10px"
                            }}
                        />

                        <Legend
                            content={renderLegendContent}
                            verticalAlign="bottom"
                            height={isMobile ? 50 : 70}
                            wrapperStyle={{
                                fontSize: isMobile ? "10px" : "11px",
                                maxHeight: isMobile ? "60px" : "80px",
                                overflowY: "auto"
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
