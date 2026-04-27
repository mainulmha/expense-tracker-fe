export const capitalize = (str) => {
  if (!str) return "Others";

  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString();
};
