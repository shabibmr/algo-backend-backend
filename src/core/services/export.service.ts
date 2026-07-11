import ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export class ExportService {
  /**
   * Generates a formatted Excel workbook buffer from columns and rows of data.
   */
  static async generateExcel(
    title: string,
    columns: ExcelColumn[],
    data: any[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    // Set columns
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width ?? 20,
    }));

    // Format Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F497D' }, // Navy blue header
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add Data Rows
    worksheet.addRows(data);

    // Format Data Rows (zebra striping, borders, alignments)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const fillColor = rowNumber % 2 === 0 ? 'FFF2F5F8' : 'FFFFFFFF';
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };

        // Align numbers right
        if (typeof cell.value === 'number') {
          cell.alignment = { horizontal: 'right' };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}
