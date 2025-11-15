// Type declaration for jspdf-autotable module
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    styles?: any;
    headStyles?: any;
    bodyStyles?: any;
    footStyles?: any;
    alternateRowStyles?: any;
    columnStyles?: any;
    margin?: any;
    theme?: 'striped' | 'grid' | 'plain';
    tableWidth?: 'auto' | 'wrap' | number;
    [key: string]: any;
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;

  export default autoTable;
}
