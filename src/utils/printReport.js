export const printReport = (filteredTransactions, totals, filters) => {
  if (filteredTransactions.length === 0) {
    alert("No data to print!");
    return;
  }

  const { startDate, endDate, selectedType, selectedCategory } = filters;
  const printWindow = window.open("", "_blank");

  const getCategoryColor = (type) => {
    if (type === "expense") return "#ef4444";
    if (type === "income") return "#22c55e";
    if (type === "investment") return "#a855f7";
    return "#6b7280";
  };

  const tableRows = filteredTransactions
    .map(
      (t) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 8px; color: #374151;">${new Date(t.date).toLocaleDateString()}</td>
            <td style="padding: 12px 8px; color: #1f2937; font-weight: 500;">${t.description || "-"}</td>
            <td style="padding: 12px 8px;">
                <span style="background: ${getCategoryColor(t.type)}20; color: ${getCategoryColor(t.type)}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                    ${t.category || "-"}
                </span>
            </td>
            <td style="padding: 12px 8px;">
                <span style="background: ${getCategoryColor(t.type)}20; color: ${getCategoryColor(t.type)}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                    ${t.type || "-"}
                </span>
            </td>
            <td style="padding: 12px 8px; text-align: right; font-weight: 600; color: ${t.type === "expense" ? "#ef4444" : t.type === "income" ? "#22c55e" : "#a855f7"};">
                ${t.type === "expense" ? "-" : "+"} Tk ${t.amount.toLocaleString()}
            </td>
        </tr>
    `,
    )
    .join("");

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Expense Report - ${new Date().toLocaleDateString()}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%); padding: 30px; min-height: 100vh; }
                    .report-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px 40px; text-align: center; }
                    .header h1 { font-size: 32px; margin-bottom: 10px; }
                    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 30px 40px; background: #f8fafc; }
                    .stat-card { text-align: center; padding: 20px; background: white; border-radius: 16px; }
                    .stat-label { font-size: 13px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; font-weight: 600; }
                    .stat-value { font-size: 28px; font-weight: 800; }
                    .stat-value.income { color: #22c55e; }
                    .stat-value.expense { color: #ef4444; }
                    .stat-value.investment { color: #a855f7; }
                    .stat-value.balance { color: #10b981; }
                    .filters-section { padding: 20px 40px; background: white; border-bottom: 1px solid #e2e8f0; }
                    .table-container { padding: 0 40px 30px 40px; overflow-x: auto; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #f8fafc; color: #475569; padding: 14px 8px; text-align: left; font-size: 12px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
                    td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; }
                    .footer { background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
                    @media print {
                        body { background: white; padding: 0; }
                        .report-container { box-shadow: none; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h1>💰 Expense Tracker Report</h1>
                        <p>Complete Financial Summary Report</p>
                        <p>Generated: ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card"><div class="stat-label">TOTAL INCOME</div><div class="stat-value income">Tk ${totals.income.toLocaleString()}</div></div>
                        <div class="stat-card"><div class="stat-label">TOTAL EXPENSE</div><div class="stat-value expense">Tk ${totals.expense.toLocaleString()}</div></div>
                        <div class="stat-card"><div class="stat-label">INVESTMENT</div><div class="stat-value investment">Tk ${totals.investment.toLocaleString()}</div></div>
                        <div class="stat-card"><div class="stat-label">BALANCE</div><div class="stat-value balance">Tk ${totals.balance.toLocaleString()}</div></div>
                    </div>
                    <div class="filters-section">
                        <strong>🔍 Applied Filters:</strong> 
                        ${startDate ? `From: ${new Date(startDate).toLocaleDateString()} ` : ""}
                        ${endDate ? `To: ${new Date(endDate).toLocaleDateString()} ` : ""}
                        ${selectedType !== "all" ? `Type: ${selectedType} ` : ""}
                        ${selectedCategory !== "all" ? `Category: ${selectedCategory}` : "All Transactions"}
                    </div>
                    <div class="table-container">
                        <table>
                            <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>Total Transactions: ${filteredTransactions.length}</p>
                        <p>© ${new Date().getFullYear()} Expense Tracker - All Rights Reserved</p>
                    </div>
                </div>
                <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
                    <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 12px 24px; border-radius: 40px; cursor: pointer; margin-right: 10px;">🖨️ Print</button>
                    <button onclick="window.close()" style="background: #64748b; color: white; border: none; padding: 12px 24px; border-radius: 40px; cursor: pointer;">✕ Close</button>
                </div>
            </body>
        </html>
    `);

  printWindow.document.close();
};
