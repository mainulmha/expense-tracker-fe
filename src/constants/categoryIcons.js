// PNG ইমেজ ইম্পোর্ট করুন (আপনার ইমেজ পাথ অনুযায়ী)
import foodImg from "../img/food.png";
import travelImg from "../img/travel.png";
import rentImg from "../img/rent.png";
import transportImg from "../img/transport.png";
import shoppingImg from "../img/shopping.png";
import medicineImg from "../img/medicine.png";
import goldImg from "../img/gold.png";
import rechargeImg from "../img/recharge.png";
import internetImg from "../img/internet.png";
import dishImg from "../img/dish.png";
import salaryImg from "../img/salary.png";
import investmentImg from "../img/investment.png";
import dpsImg from "../img/dps.png";
import fdrImg from "../img/fdr.png";
import shareImg from "../img/share.png";
import otherImg from "../img/other.png";

// ক্যাটাগরি আইকন ম্যাপিং
export const categoryIconMap = {
  // Expense Categories
  food: { img: foodImg, color: "#EF4444", bgColor: "#EF444420", label: "Food" },
  travel: {
    img: travelImg,
    color: "#FFC053",
    bgColor: "#FFC05320",
    label: "Travel",
  },
  rent: { img: rentImg, color: "#6B7280", bgColor: "#6B728020", label: "Rent" },
  transport: {
    img: transportImg,
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    label: "Transport",
  },
  shopping: {
    img: shoppingImg,
    color: "#EC4899",
    bgColor: "#EC489920",
    label: "Shopping",
  },
  medicine: {
    img: medicineImg,
    color: "#DC2626",
    bgColor: "#DC262620",
    label: "Medicine",
  },
  gold: { img: goldImg, color: "#FBBF24", bgColor: "#FBBF2420", label: "Gold" },
  recharge: {
    img: rechargeImg,
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    label: "Recharge",
  },
  "internet bill": {
    img: internetImg,
    color: "#3B82F6",
    bgColor: "#3B82F620",
    label: "Internet Bill",
  },
  "dish bill": {
    img: dishImg,
    color: "#EC4899",
    bgColor: "#EC489920",
    label: "Dish Bill",
  },

  // Income Categories
  salary: {
    img: salaryImg,
    color: "#22C55E",
    bgColor: "#22C55E20",
    label: "Salary",
  },
  investment: {
    img: investmentImg,
    color: "#10B981",
    bgColor: "#10B98120",
    label: "Investment",
  },

  // Investment Categories
  dps: { img: dpsImg, color: "#10B981", bgColor: "#10B98120", label: "DPS" },
  fdr: { img: fdrImg, color: "#10B981", bgColor: "#10B98120", label: "FDR" },
  share: {
    img: shareImg,
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    label: "Share",
  },

  // Default
  other: {
    img: otherImg,
    color: "#6B7280",
    bgColor: "#6B728020",
    label: "Other",
  },
};

// ক্যাটাগরির আইকন তথ্য পাওয়ার ফাংশন
export const getCategoryIcon = (categoryName) => {
  const icon = categoryIconMap[categoryName?.toLowerCase()];
  return icon || categoryIconMap.other;
};

// ক্যাটাগরির নাম ফরম্যাট করার ফাংশন
export const formatCategoryName = (category) => {
  const icon = categoryIconMap[category?.toLowerCase()];
  if (icon) return icon.label;

  if (category === "internet bill") return "Internet Bill";
  if (category === "dish bill") return "Dish Bill";
  return category?.charAt(0).toUpperCase() + category?.slice(1);
};
