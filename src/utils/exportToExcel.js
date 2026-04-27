import * as XLSX from "xlsx";

export const exportToExcel = (filteredTransactions) => {
  if (filteredTransactions.length === 0) {
    alert("No data to export!");
    return;
  }

  const exportData = filteredTransactions.map((t) => ({
    Date: new Date(t.date).toLocaleDateString(),
    Description: t.description,
    Category: t.category,
    Type: t.type,
    Amount: t.amount,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
  XLSX.writeFile(
    wb,
    `expense_report_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};
