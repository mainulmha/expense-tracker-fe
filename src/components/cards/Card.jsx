import React from 'react';

const Card = ({ title, value, type = "default", icon }) => {
    // Define colors based on type
    const styles = {
        income: {
            border: "border-emerald-500/20",
            text: "text-emerald-400",
            bg: "bg-emerald-500/5"
        },
        expense: {
            border: "border-red-500/20",
            text: "text-red-400",
            bg: "bg-red-500/5"
        },
        investment: {
            border: "border-purple-500/20",
            text: "text-purple-400",
            bg: "bg-purple-500/5"
        },
        default: {
            border: "border-gray-800",
            text: "text-gray-100",
            bg: "bg-[#111827]"
        }
    };

    const activeStyle = styles[type] || styles.default;

    return (
        <div className={`${activeStyle.bg} rounded-[1.5rem] p-5 border ${activeStyle.border} transition-all duration-300 hover:border-gray-700 shadow-xl`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        {title}
                    </p>
                    <p className={`${activeStyle.text} text-2xl font-black mt-2 tracking-tight`}>
                        ৳ {value?.toLocaleString() || 0}
                    </p>
                </div>
                {icon && (
                    <div className={`p-2 rounded-xl ${activeStyle.bg} border ${activeStyle.border} text-lg`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
