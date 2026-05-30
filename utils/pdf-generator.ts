import jsPDF from "jspdf";
import autoTable, { ColumnInput, Styles } from "jspdf-autotable";

interface PdfHeaderConfig {
  title?: string;
  subtitle?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  logoImageUrl?: string;
}

export const generatePdfWithHeader = async (
  config: PdfHeaderConfig,
  tableData: string[][],
  columns: string[],
  columnStyles?: Record<number, Partial<Styles>>,
) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Set font for header
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  // Header area: logos at sides and centered title/tagline/period
  const headerTop = 12; // top Y of header area in mm
  const headerHeight = 30; // total header area height in mm (reduced)
  const logoSize = 36; // square logo size in mm (slightly smaller)
  const centerY = headerTop + headerHeight / 2;

  if (config.logoImageUrl) {
    // Place logos left and right, vertically centered in header area
    const logoY = centerY - logoSize / 2;
    doc.addImage(config.logoImageUrl, "PNG", 12, logoY, logoSize, logoSize);
    doc.addImage(
      config.logoImageUrl,
      "PNG",
      pageWidth - 12 - logoSize,
      logoY,
      logoSize,
      logoSize,
    );
  } else {
    // Fallback to text if no image (placed near left/right within header)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("☀ SURYA JAYA", 15, centerY - 6);
    doc.text("MOTOR", 15, centerY + 2);
    doc.text("☀ SURYA JAYA", pageWidth - 60, centerY - 6);
    doc.text("MOTOR", pageWidth - 60, centerY + 2);
  }

  // Title, tagline and period centered in header
  const titleText = "SURYA JAYA MOTOR";
  doc.setFontSize(18);
  doc.setTextColor(23, 78, 150);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, centerY - 4);

  const taglineText = config.title ?? "Laporan Keuangan";
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const taglineWidth = doc.getTextWidth(taglineText);
  doc.text(taglineText, (pageWidth - taglineWidth) / 2, centerY + 1);

  if (config.dateRange) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const dateText = config.dateRange.to
      ? `Periode: ${config.dateRange.from} - ${config.dateRange.to}`
      : `Periode: ${config.dateRange.from}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, (pageWidth - dateWidth) / 2, centerY + 6);
  }

  // Divider line below header
  const afterHeaderY = headerTop + headerHeight;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, afterHeaderY, pageWidth - 15, afterHeaderY);

  currentY = afterHeaderY + 6;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 15, right: 15 },
    head: [columns],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 8,
      halign: "center" as const,
      valign: "middle" as const,
      lineColor: [220, 220, 220] as [number, number, number],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [23, 78, 150] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center" as const,
      valign: "middle" as const,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250] as [number, number, number],
    },
    columnStyles: columnStyles ?? {
      0: { halign: "center" as const, cellWidth: 12 },
    },
  });

  return doc;
};

export const downloadPdf = (doc: jsPDF, filename: string) => {
  try {
    const pdf = doc.output("blob");
    const url = URL.createObjectURL(pdf);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    // Fallback to doc.save if blob method fails
    doc.save(filename);
  }
};

export const openPdfInNewTab = (doc: jsPDF, fallbackFilename?: string) => {
  try {
    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      newWindow.focus();
      // Revoke object URL after a delay to allow browser to load
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } else {
      // Popup blocked — fallback to download
      console.warn("Popup blocked, falling back to download");
      downloadPdf(
        doc,
        fallbackFilename ||
          `laporan-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    }
  } catch (error) {
    console.error("Error opening PDF in new tab:", error);
    // Fallback to download
    downloadPdf(
      doc,
      fallbackFilename ||
        `laporan-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  }
};
