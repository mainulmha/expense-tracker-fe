import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (filteredTransactions, totals, filters) => {
  if (filteredTransactions.length === 0) {
    alert("No data to export!");
    return;
  }

  try {
    const { startDate, endDate, selectedType, selectedCategory } = filters;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica");

    // Header
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, pageWidth, 55, "F");

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Expense Tracker Report", pageWidth / 2, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Complete Financial Summary Report", pageWidth / 2, 38, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 48, {
      align: "center",
    });

    // Statistics Cards
    const cardWidth = (pageWidth - 30) / 4;
    const cardX = [
      10,
      10 + cardWidth + 3,
      10 + (cardWidth + 3) * 2,
      10 + (cardWidth + 3) * 3,
    ];

    const stats = [
      {
        label: "TOTAL INCOME",
        value: `Tk ${totals.income.toLocaleString()}`,
        color: [34, 197, 94],
      },
      {
        label: "TOTAL EXPENSE",
        value: `Tk ${totals.expense.toLocaleString()}`,
        color: [239, 68, 68],
      },
      {
        label: "INVESTMENT",
        value: `Tk ${totals.investment.toLocaleString()}`,
        color: [168, 85, 247],
      },
      {
        label: "BALANCE",
        value: `Tk ${totals.balance.toLocaleString()}`,
        color: [16, 185, 129],
      },
    ];

    let yPos = 70;

    stats.forEach((stat, index) => {
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(cardX[index], yPos, cardWidth, 45, 4, 4, "F");
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(cardX[index], yPos, cardWidth, 45, 4, 4, "S");

      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "bold");
      doc.text(stat.label, cardX[index] + cardWidth / 2, yPos + 15, {
        align: "center",
      });

      doc.setFontSize(18);
      doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
      doc.setFont("helvetica", "bold");
      doc.text(stat.value, cardX[index] + cardWidth / 2, yPos + 35, {
        align: "center",
      });
    });

    yPos += 55;

    // Filters Section
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, yPos, pageWidth - 20, 30, 4, 4, "F");
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(10, yPos, pageWidth - 20, 30, 4, 4, "S");

    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "bold");
    doc.text("APPLIED FILTERS", 18, yPos + 12);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");

    let filterText = "";
    if (startDate)
      filterText += `From: ${new Date(startDate).toLocaleDateString()}  `;
    if (endDate)
      filterText += `To: ${new Date(endDate).toLocaleDateString()}  `;
    if (selectedType !== "all") filterText += `Type: ${selectedType}  `;
    if (selectedCategory !== "all")
      filterText += `Category: ${selectedCategory}  `;
    if (filterText === "") filterText = "All Transactions";

    doc.text(filterText, 18, yPos + 22);

    yPos += 40;

    // Transaction Table
    const tableData = filteredTransactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.description || "-",
      t.category || "-",
      t.type || "-",
      `${t.type === "expense" ? "-" : "+"} Tk ${t.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["DATE", "DESCRIPTION", "CATEGORY", "TYPE", "AMOUNT"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [5, 150, 105],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "left",
        cellPadding: 8,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [55, 65, 81],
        cellPadding: 6,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 35, halign: "left" },
        1: { cellWidth: 55, halign: "left" },
        2: { cellWidth: 40, halign: "left" },
        3: { cellWidth: 35, halign: "left" },
        4: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 10, right: 10 },
      tableWidth: "auto",
      styles: {
        overflow: "linebreak",
        lineWidth: 0.1,
      },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - 15,
          pageHeight - 12,
          { align: "right" },
        );
      },
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 12;

    if (finalY < pageHeight - 40) {
      doc.setFillColor(249, 250, 251);
      doc.rect(0, finalY, pageWidth, 35, "F");

      doc.setFontSize(9);
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Transactions: ${filteredTransactions.length}`,
        pageWidth / 2,
        finalY + 12,
        { align: "center" },
      );
      doc.text(
        "This is a computer generated report from Expense Tracker Application",
        pageWidth / 2,
        finalY + 20,
        { align: "center" },
      );
      doc.text(
        `© ${new Date().getFullYear()} Expense Tracker - All Rights Reserved`,
        pageWidth / 2,
        finalY + 28,
        { align: "center" },
      );
    }

    doc.save(`expense_report_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to export PDF! Please check console.");
  }
};
