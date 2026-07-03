declare module 'xlsx/xlsx.mjs' {
  import * as XLSX from 'xlsx'

  export = XLSX
}

declare module 'xlsx/dist/cpexcel.full.mjs' {
  const cptable: unknown

  export = cptable
}
