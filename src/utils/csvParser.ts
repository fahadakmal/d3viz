import Papa from 'papaparse';

interface ParseResult {
  data: Record<string, string>[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

export const parseCSV = (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Convert any non-string values back to strings for consistent handling
        const data = results.data.map(row => {
          const newRow: Record<string, string> = {};
          Object.entries(row).forEach(([key, value]) => {
            newRow[key] = value !== null && value !== undefined ? String(value) : '';
          });
          return newRow;
        });

        resolve({
          data,
          errors: results.errors,
          meta: results.meta
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const generateCSV = (data: Record<string, any>[]): string => {
  return Papa.unparse(data);
};

export const downloadCSV = (data: Record<string, any>[], filename: string) => {
  const csv = generateCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};