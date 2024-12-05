import * as XLSX from 'xlsx';
import { Product, Sale, Customer } from '../types';

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const importFromExcel = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportProductsTemplate = () => {
  const template = [
    {
      name: '',
      code: '',
      barcode: '',
      costPrice: '',
      salePrice: '',
      stock: '',
      categoryId: '',
      supplierId: '',
      minimumStock: '',
      description: ''
    }
  ];
  exportToExcel(template, 'products_template');
};

export const generateSalesReport = (
  sales: Sale[],
  startDate: Date,
  endDate: Date,
  format: 'excel' | 'pdf' = 'excel'
) => {
  const filteredSales = sales.filter(
    sale => sale.timestamp >= startDate.getTime() && sale.timestamp <= endDate.getTime()
  );

  const reportData = filteredSales.map(sale => ({
    'Receipt #': sale.receiptNumber,
    'Date': new Date(sale.timestamp).toLocaleString(),
    'Items': sale.items.length,
    'Subtotal': sale.subtotal.toFixed(2),
    'Tax': sale.tax.toFixed(2),
    'Discount': sale.discount?.toFixed(2) || '0.00',
    'Total': sale.total.toFixed(2),
    'Payment Method': sale.payments.map(p => p.type).join(', '),
    'Status': sale.status
  }));

  if (format === 'excel') {
    exportToExcel(reportData, `sales_report_${startDate.toISOString().split('T')[0]}`);
  } else {
    // Implement PDF generation using @react-pdf/renderer
  }
};