import Papa from "papaparse";

const BOM = "\uFEFF";

export function downloadCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: (keyof T)[]
) {
  const colNames = columns
    ? (columns as string[])
    : (Object.keys(data[0] ?? {}) as string[]);
  const csv = Papa.unparse(data, {
    columns: colNames,
    header: true,
  });
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
