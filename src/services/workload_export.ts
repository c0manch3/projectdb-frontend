import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UnifiedWorkload, User, Project } from '../store/types';
import { setupPdfFonts } from '../utils/pdf_fonts';

// Export format types
export type ExportFormat = 'pdf' | 'google-sheets';

// Export data structure
export interface ExportData {
  workloads: UnifiedWorkload[];
  employees: User[];
  projects: Project[];
  filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    projectId?: string;
  };
}

// Processed row for export
export interface ExportRow {
  date: string;
  employeeName: string;
  projectName: string;
  status: string;
  hoursWorked: string;
  userText: string;
}

// Export service
export const workloadExportService = {
  // Prepare data for export
  prepareExportData(data: ExportData): ExportRow[] {
    const rows: ExportRow[] = [];

    data.workloads.forEach((workload) => {
      const employee = data.employees.find((emp) => emp.id === workload.userId);
      const project = data.projects.find((proj) => proj.id === workload.projectId);

      if (!employee || !project) return;

      const status = this.getWorkloadStatus(workload);
      const formattedDate = new Date(workload.date).toLocaleDateString('ru-RU');

      // Clean userText from 'undefined' string
      let cleanUserText = workload.userText || '-';
      if (cleanUserText.startsWith('undefined | ')) {
        cleanUserText = cleanUserText.replace('undefined | ', '');
      } else if (cleanUserText === 'undefined') {
        cleanUserText = '-';
      }

      rows.push({
        date: formattedDate,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        projectName: project.name,
        status: this.getStatusLabel(status),
        hoursWorked: workload.hoursWorked ? `${workload.hoursWorked} ч` : '-',
        userText: cleanUserText
      });
    });

    // Sort by date
    rows.sort((a, b) => {
      const dateA = this.parseRussianDate(a.date);
      const dateB = this.parseRussianDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return rows;
  },

  // Parse Russian date format (DD.MM.YYYY) to Date object
  parseRussianDate(dateStr: string): Date {
    const parts = dateStr.split('.').map(Number);
    const day = parts[0] ?? 1;
    const month = parts[1] ?? 1;
    const year = parts[2] ?? new Date().getFullYear();
    return new Date(year, month - 1, day);
  },

  // Get workload status
  getWorkloadStatus(workload: UnifiedWorkload): 'planned' | 'completed' | 'missing' | 'overtime' {
    if (workload.planId && workload.actualId) {
      return 'completed';
    } else if (workload.planId && !workload.actualId) {
      return 'missing';
    } else if (!workload.planId && workload.actualId) {
      return 'overtime';
    } else {
      return 'planned';
    }
  },

  // Get status label
  getStatusLabel(status: 'planned' | 'completed' | 'missing' | 'overtime'): string {
    switch (status) {
      case 'planned':
        return 'Запланировано';
      case 'completed':
        return 'Выполнено';
      case 'missing':
        return 'Не отчитался';
      case 'overtime':
        return 'Сверхурочно';
      default:
        return status;
    }
  },


  // Export to PDF
  exportToPDF(data: ExportData, filename?: string): void {
    const rows = this.prepareExportData(data);

    // Create new PDF document with UTF-8 support
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    // Add DejaVu Sans font for full Cyrillic support
    setupPdfFonts(doc);

    // Title
    doc.setFontSize(16);
    doc.text('Отчет по загруженности сотрудников', 14, 15);

    // Filters info
    doc.setFontSize(10);
    let yPos = 25;

    if (data.filters.startDate || data.filters.endDate) {
      const dateRange = `Период: ${data.filters.startDate || '...'} - ${data.filters.endDate || '...'}`;
      doc.text(dateRange, 14, yPos);
      yPos += 5;
    }

    if (data.filters.userId) {
      const employee = data.employees.find((emp) => emp.id === data.filters.userId);
      if (employee) {
        doc.text(`Сотрудник: ${employee.firstName} ${employee.lastName}`, 14, yPos);
        yPos += 5;
      }
    }

    if (data.filters.projectId) {
      const project = data.projects.find((proj) => proj.id === data.filters.projectId);
      if (project) {
        doc.text(`Проект: ${project.name}`, 14, yPos);
        yPos += 5;
      }
    }

    // Table with full Cyrillic support using DejaVu Sans
    autoTable(doc, {
      startY: yPos + 5,
      head: [['Дата', 'Сотрудник', 'Проект', 'Статус', 'Часы', 'Описание работы']],
      body: rows.map((row) => [
        row.date,
        row.employeeName,
        row.projectName,
        row.status,
        row.hoursWorked,
        row.userText
      ]),
      styles: {
        font: 'DejaVuSans',
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      headStyles: {
        font: 'DejaVuSans',
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'normal',
        halign: 'center',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 10 },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' }, // Date
        1: { cellWidth: 45 }, // Employee
        2: { cellWidth: 50 }, // Project
        3: { cellWidth: 30, halign: 'center' }, // Status
        4: { cellWidth: 20, halign: 'center' }, // Hours
        5: { cellWidth: 'auto' }, // Description
      },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Страница ${i} из ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Сформировано: ${new Date().toLocaleString('ru-RU')}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Save the PDF
    const finalFilename = filename || `workload_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(finalFilename);
  },

  // Export to Google Sheets (creates CSV format that can be imported)
  exportToGoogleSheets(data: ExportData): void {
    const rows = this.prepareExportData(data);

    // Create CSV content
    const headers = ['Дата', 'Сотрудник', 'Проект', 'Статус', 'Часы', 'Описание работы'];
    const csvRows = [
      headers.join(','),
      ...rows.map((row) => [
        this.escapeCsvValue(row.date),
        this.escapeCsvValue(row.employeeName),
        this.escapeCsvValue(row.projectName),
        this.escapeCsvValue(row.status),
        this.escapeCsvValue(row.hoursWorked),
        this.escapeCsvValue(row.userText)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `workload_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Escape CSV value
  escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  },

  // Get export instructions for Google Sheets
  getGoogleSheetsInstructions(): string {
    return `
Инструкция по импорту в Google Таблицы:

1. Откройте Google Таблицы (sheets.google.com)
2. Создайте новую таблицу или откройте существующую
3. Нажмите Файл → Импортировать
4. Выберите вкладку "Загрузить"
5. Перетащите загруженный CSV файл или нажмите "Выбрать файл"
6. Выберите "Заменить таблицу" или "Вставить новые листы"
7. Нажмите "Импортировать данные"

Данные будут автоматически отформатированы в таблице.
    `.trim();
  },

  // Calculate summary statistics
  calculateSummary(data: ExportData): {
    totalWorkloads: number;
    totalPlanned: number;
    totalCompleted: number;
    totalMissing: number;
    totalOvertime: number;
    totalHours: number;
    uniqueEmployees: number;
    uniqueProjects: number;
  } {
    const rows = this.prepareExportData(data);

    const summary = {
      totalWorkloads: rows.length,
      totalPlanned: 0,
      totalCompleted: 0,
      totalMissing: 0,
      totalOvertime: 0,
      totalHours: 0,
      uniqueEmployees: new Set<string>(),
      uniqueProjects: new Set<string>(),
    };

    data.workloads.forEach((workload) => {
      const status = this.getWorkloadStatus(workload);

      switch (status) {
        case 'planned':
          summary.totalPlanned++;
          break;
        case 'completed':
          summary.totalCompleted++;
          break;
        case 'missing':
          summary.totalMissing++;
          break;
        case 'overtime':
          summary.totalOvertime++;
          break;
      }

      if (workload.hoursWorked) {
        summary.totalHours += workload.hoursWorked;
      }

      summary.uniqueEmployees.add(workload.userId);
      summary.uniqueProjects.add(workload.projectId);
    });

    return {
      ...summary,
      uniqueEmployees: summary.uniqueEmployees.size,
      uniqueProjects: summary.uniqueProjects.size,
    };
  }
};
