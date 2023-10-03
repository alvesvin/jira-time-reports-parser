import { XLSX } from "./libs/xlsx.js";

const [_NODE_PATH, _CWD, FILEPATH] = process.argv;
const RATE = 37.5;

const workbook = XLSX.readFile(FILEPATH, { raw: true });
const sheet0 = workbook.Sheets[workbook.SheetNames[0]];
const jdata = XLSX.utils.sheet_to_json(sheet0);

const parsedObj = jdata
  .filter((data: any) => data["Clave"] || data["Key"])
  .reduce((acm: any, crr: any) => {
    const key = crr["Clave"] || crr["Key"];
    const hour = +(+(crr["Tempo Gasto (h)"] || crr["Time Spent (h)"]).replace(",", ".")).toFixed(2);
    return {
      ...acm,
      ...(key ? { [key]: (acm[key] || 0) + hour } : {}),
    };
  }, {} as Record<string, number>) as Record<string, number>;

const parsed = Object.entries(parsedObj).map(([key, hour]) => {
  return {
    "Main Deliverables": key,
    Hours: hour,
    Rate: RATE,
    Amount: +(hour * RATE).toFixed(2),
  };
});

parsed.push({
  "Main Deliverables": "Total",
  Hours: +parsed.reduce((acm, crr) => acm + crr.Hours, 0).toFixed(2),
  Amount: +parsed.reduce((acm, crr) => acm + crr.Amount, 0).toFixed(2),
  Rate: RATE,
});

const resultWorkbook = XLSX.utils.book_new();
const resultWorksheet = XLSX.utils.json_to_sheet(parsed);
XLSX.utils.book_append_sheet(resultWorkbook, resultWorksheet);
XLSX.writeFile(resultWorkbook, "result.xlsx");
