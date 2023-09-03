import { XLSX } from "./libs/xlsx.js";

const [NODE_PATH, CWD, FILEPATH] = process.argv;
const RATE = 35.7;

const workbook = XLSX.readFile(FILEPATH, { raw: true });
const sheet0 = workbook.Sheets[workbook.SheetNames[0]];
const jdata = XLSX.utils.sheet_to_json(sheet0);

const parsedObj = jdata
  .filter((data: any) => data["Clave"])
  .reduce((acm: any, crr: any) => {
    const key = crr["Clave"];
    const hour = +crr["Tempo Gasto (h)"].replace(",", ".");
    return {
      ...acm,
      ...(key ? { [key]: (acm[key] || 0) + hour } : {}),
    };
  }, {} as Record<string, number>) as Record<string, number>;

const parsed = Object.entries(parsedObj)
  .map(([key, hour]) => {
    return {
      "Main Deliverables": key,
      Hours: hour,
      Rate: RATE,
      Amount: +(hour * RATE).toFixed(2),
    };
  })
  .concat({
    "Main Deliverables": "Total",
    Hours: 0,
  });

console.log(parsed.length);
