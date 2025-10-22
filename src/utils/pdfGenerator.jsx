import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate Professional PDF Report for KISWOK Industries
 * Developer: Alphatech Solutions
 */
export const generateHistoricalReportPDF = (reportData, reportConfig, fromDateRef, toDateRef) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Helper function to get tag display name
  const getTagDisplayName = (tag) => {
    const tagNames = {
      'voltageR': 'R Phase Voltage',
      'voltageY': 'Y Phase Voltage', 
      'voltageB': 'B Phase Voltage',
      'currentR': 'R Phase Current',
      'currentY': 'Y Phase Current',
      'currentB': 'B Phase Current',
      'kwh': 'Energy (kWh)'
    };
    return tagNames[tag] || tag;
  };

  // Helper function to get units
  const getTagUnit = (tag) => {
    if (tag.includes('voltage')) return 'V';
    if (tag.includes('current')) return 'A'; 
    if (tag === 'kwh') return 'kWh';
    return '';
  };

  // ===== HEADER SECTION =====
  // Company Banner Background
  doc.setFillColor(30, 58, 138); // Dark blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Main Title
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CLOUD SCADA', pageWidth / 2, 12, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Supervisory Control and Data Acquisition', pageWidth / 2, 19, { align: 'center' });
  
  // Client Name
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text('KISWOK INDUSTRIES', pageWidth / 2, 26, { align: 'center' });
  
  // Developer Credit
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('Developed by Alphatech Solutions', pageWidth / 2, 31, { align: 'center' });
  
  // ===== REPORT INFO SECTION =====
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.text('Historical Report', 14, 45);
  
  // Report Details Box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(14, 50, pageWidth - 28, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'bold');
  doc.text('Parameter:', 18, 57);
  doc.text('From:', 18, 64);
  doc.text('To:', 18, 71);
  doc.text('Generated:', 18, 78);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(getTagDisplayName(reportConfig.tag), 42, 57);
  doc.text(fromDateRef.current?.value?.replace('T', ' ') || 'N/A', 42, 64);
  doc.text(toDateRef.current?.value?.replace('T', ' ') || 'N/A', 42, 71);
  doc.text(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), 42, 78);
  
  // Total Records Count
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`Total Records: ${reportData.length}`, pageWidth - 18, 57, { align: 'right' });
  
  // ===== DATA TABLE =====
  const tableData = reportData.slice().reverse().map(item => [
    item.timestamp,
    getTagDisplayName(reportConfig.tag),
    item.value.toFixed(2),
    getTagUnit(reportConfig.tag)
  ]);
  
  // USE autoTable FUNCTION (NOT doc.autoTable)
  autoTable(doc, {
    head: [['Timestamp', 'Parameter', 'Value', 'Unit']],
    body: tableData,
    startY: 85,
    theme: 'grid',
    headStyles: { 
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4,
      lineColor: [200, 200, 200],
      lineWidth: 0.1
    },
    columnStyles: {
      0: { halign: 'left' },                    // Timestamp
      1: { halign: 'left' },                    // Parameter
      2: { halign: 'right', fontStyle: 'bold' }, // Value
      3: { halign: 'center' }                   // Unit
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
    didDrawPage: function(data) {
      // ===== FOOTER ON EACH PAGE =====
      const footerY = pageHeight - 15;
      
      // Footer separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
      
      // Page numbers
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      const pageText = `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`;
      doc.text(pageText, pageWidth / 2, footerY, { align: 'center' });
      
      // Footer left - Company info
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Alphatech Solutions', 14, footerY);
      
      // Footer right - Contact
      doc.text('contact@alphatechsolutions.in', pageWidth - 14, footerY, { align: 'right' });
    }
  });
  
  // ===== FINAL PAGE FOOTER (After table) =====
  const finalY = doc.lastAutoTable.finalY || 85;
  
  if (finalY < pageHeight - 40) {
    // Add summary section if space available
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Summary:', 14, finalY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`This report contains ${reportData.length} data points for ${getTagDisplayName(reportConfig.tag)}.`, 14, finalY + 17);
    doc.text(`Data collected from ${fromDateRef.current?.value?.replace('T', ' ')} to ${toDateRef.current?.value?.replace('T', ' ')}.`, 14, finalY + 23);
  }
  
  // ===== SAVE PDF =====
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const fileName = `KISWOK_${getTagDisplayName(reportConfig.tag).replace(/\s+/g, '_')}_${dateStr}_${timeStr}.pdf`;
  doc.save(fileName);
};


/**
 * Generate Alert Log PDF Report
 * Can be extended for alert history exports
 */
export const generateAlertLogPDF = (alertData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Header
  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('CLOUD SCADA - Alert Log', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setTextColor(220, 220, 220);
  doc.text('KISWOK INDUSTRIES', pageWidth / 2, 23, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 180);
  doc.text('Developed by Alphatech Solutions', pageWidth / 2, 30, { align: 'center' });
  
  // Table data
  const tableData = alertData.map(alert => [
    alert.timestamp,
    alert.parameter,
    alert.value,
    alert.threshold,
    alert.status
  ]);
  
  // USE autoTable FUNCTION (NOT doc.autoTable)
  autoTable(doc, {
    head: [['Timestamp', 'Parameter', 'Value', 'Threshold', 'Status']],
    body: tableData,
    startY: 45,
    theme: 'grid',
    headStyles: { 
      fillColor: [239, 68, 68], // Red for alerts
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { halign: 'left' },                    // Timestamp
      1: { halign: 'left' },                    // Parameter
      2: { halign: 'right', fontStyle: 'bold' }, // Value
      3: { halign: 'right', fontStyle: 'bold' }, // Threshold
      4: { halign: 'center' }                   // Status
    },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
    didDrawPage: function(data) {
      const footerY = pageHeight - 15;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const pageText = `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`;
      doc.text(pageText, pageWidth / 2, footerY, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text('Alphatech Solutions', 14, footerY);
      doc.text('contact@alphatechsolutions.in', pageWidth - 14, footerY, { align: 'right' });
    }
  });
  
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`KISWOK_Alert_Log_${dateStr}.pdf`);
};
