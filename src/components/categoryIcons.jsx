// PNG ইমেজ ইম্পোর্ট
import foodImg from "../img/food.png";
import travelImg from "../img/travel.png";
import transportImg from "../img/transport.png";
import shoppingImg from "../img/shopping.png";
import entertainmentImg from "../img/entertainment.png";
import healthImg from "../img/health.png";
import rentImg from "../img/rent.png";
import studyImg from "../img/study.png";
import moneyImg from "../img/money.png";
import investmentImg from "../img/investment.png";
import dpsImg from "../img/dps.png";
import goldImg from "../img/gold.png";
import otherImg from "../img/other.png";

// আইকন ম্যাপিং
export const iconMap = {
    food: { img: foodImg, color: "#EF4444", label: "Food" },
    travel: { img: travelImg, color: "#FFC053", label: "Travel" },
    transport: { img: transportImg, color: "#F59E0B", label: "Transport" },
    shopping: { img: shoppingImg, color: "#EC4899", label: "Shopping" },
    entertainment: { img: entertainmentImg, color: "#8B5CF6", label: "Entertainment" },
    health: { img: healthImg, color: "#DC2626", label: "Health" },
    rent: { img: rentImg, color: "#6B7280", label: "Rent" },
    study: { img: studyImg, color: "#3B82F6", label: "Study" },
    education: { img: studyImg, color: "#3B82F6", label: "Education" },
    money: { img: moneyImg, color: "#22C55E", label: "Money" },
    salary: { img: moneyImg, color: "#22C55E", label: "Salary" },
    investment: { img: investmentImg, color: "#10B981", label: "Investment" },
    dps: { img: dpsImg, color: "#10B981", label: "DPS" },
    fdr: { img: dpsImg, color: "#10B981", label: "FDR" },
    share: { img: investmentImg, color: "#10B981", label: "Share" },
    gold: { img: goldImg, color: "#FBBF24", label: "Gold" },
    other: { img: otherImg, color: "#6B7280", label: "Other" }
};

// আইকন পাওয়ার ফাংশন
export const getCategoryIcon = (iconName) => {
    return iconMap[iconName] || iconMap.other;
};

// ক্যাটাগরি ফরম্যাট করা
export const formatCategoryName = (name) => {
    const icon = iconMap[name];
    if (icon) return icon.label;
    return name?.charAt(0).toUpperCase() + name?.slice(1);
};