import { jsPDF } from 'jspdf';
import { DEJAVU_SANS_FONT } from './dejavu_sans_font';

/**
 * Add DejaVu Sans font to jsPDF document
 * This font has full Cyrillic (Russian) support
 */
export function addDejaVuFont(doc: jsPDF): void {
  try {
    // Add the font to VFS (Virtual File System)
    doc.addFileToVFS('DejaVuSans.ttf', DEJAVU_SANS_FONT);

    // Register the font
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');

    // Set as active font
    doc.setFont('DejaVuSans', 'normal');
  } catch (error) {
    console.error('Error adding DejaVu Sans font:', error);
    // Fallback to courier
    doc.setFont('courier', 'normal');
  }
}

/**
 * Setup PDF fonts with Cyrillic support
 * Call this before adding any text to the PDF
 */
export function setupPdfFonts(doc: jsPDF): void {
  addDejaVuFont(doc);
}
