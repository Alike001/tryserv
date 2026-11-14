import test from "node:test";
import assert from "node:assert/strict";
import {extractTABBATADocuments,parseCsv,TABBATA_UPLOAD_LIMITS} from "../tabbata-documents.mjs";
import ExcelJS from "exceljs";

const base64=text=>Buffer.from(text,"utf8").toString("base64");
test("CSV parser preserves quoted commas and escaped quotes",()=>{
 assert.deepEqual(parseCsv('Name,Note\n"Community A","Pipes, valves and ""fittings"""'),[
  ["Name","Note"],["Community A",'Pipes, valves and "fittings"']
 ]);
 assert.throws(()=>parseCsv('Name,Note\n"unclosed,value'),/unclosed/);
});
test("extracts text and CSV with stable source locators and exact text",async()=>{
 const docs=await extractTABBATADocuments([
  {name:"field-notes.txt",data_base64:base64("Site C is still undergoing water quality testing.\nFollow-up visit is scheduled.")},
  {name:"households.csv",data_base64:base64("Community,Households\nA,150\nB,140")}
 ]);
 assert.equal(docs.length,2);
 assert.equal(docs[0].segments[0].locator,"Line 1");
 assert.equal(docs[0].segments[0].text,"Site C is still undergoing water quality testing.");
 assert.equal(docs[1].segments[0].locator,"Row 2");
 assert.match(docs[1].segments[0].text,/Community: A \| Households: 150/);
 assert.equal(docs[1].segments[0].cells.Community,"A");
 assert.equal(docs[1].segments[0].cells.Households,"150");
 assert.equal(docs[0].id,"doc-1");
 assert.equal(docs[1].id,"doc-2");
});
function makeOnePagePdf(text){
 const slash=String.fromCharCode(92);
 const escaped=text.split(slash).join(slash+slash).split("(").join(slash+"(").split(")").join(slash+")");
 const stream="BT /F1 12 Tf 72 720 Td ("+escaped+") Tj ET";
 const objects=[
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${Buffer.byteLength(stream)} >>
stream
${stream}
endstream`
 ];
 let output=`%PDF-1.4
`;const offsets=[0];
 for(let index=0;index<objects.length;index++){offsets.push(Buffer.byteLength(output));output+=`${index+1} 0 obj
${objects[index]}
endobj
`;}
 const xref=Buffer.byteLength(output);output+=`xref
0 6
0000000000 65535 f 
`;
 for(let index=1;index<offsets.length;index++)output+=String(offsets[index]).padStart(10,"0")+" 00000 n \n";
 output+=`trailer
<< /Size 6 /Root 1 0 R >>
startxref
${xref}
%%EOF
`;
 return Buffer.from(output,"binary");
}
test("PDF text extraction retains page locators",async()=>{
 const bytes=makeOnePagePdf("Project evidence summary for Site A");
 const docs=await extractTABBATADocuments([{name:"report.pdf",data_base64:bytes.toString("base64")}]);
 assert.equal(docs[0].segments[0].locator,"Page 1");
 assert.match(docs[0].segments[0].text,/Project evidence summary for Site A/);
});

test("XLSX rows retain sheet and row locators and formulas are not executed",async()=>{
 const workbook=new ExcelJS.Workbook();
 const sheet=workbook.addWorksheet("Expenses");
 sheet.addRow(["Date","Amount"]);
 sheet.addRow(["2026-08-01",1500000]);
 sheet.addRow(["2026-08-02",{formula:"SUM(B2:B2)",result:1500000}]);
 const buffer=Buffer.from(await workbook.xlsx.writeBuffer());
 const docs=await extractTABBATADocuments([{name:"expenses.xlsx",data_base64:buffer.toString("base64")}]);
 assert.equal(docs[0].segments[0].locator,"Sheet Expenses · Row 2");
 assert.match(docs[0].segments[0].text,/Amount: 1500000/);
 assert.equal(docs[0].segments[0].cells.Date,"2026-08-01");
 assert.equal(docs[0].segments[0].cells.Amount,"1500000");
 assert.equal(docs[0].segments[1].locator,"Sheet Expenses · Row 3");
 assert.match(docs[0].segments[1].text,/formula cell not evaluated/);
});

test("file names and file types are restricted",async()=>{
 await assert.rejects(()=>extractTABBATADocuments([{name:"payload.exe",data_base64:base64("bad")}]),/Unsupported file type/);
 await assert.rejects(()=>extractTABBATADocuments([{name:"bad.pdf",data_base64:base64("not a pdf")}]),/does not appear to be a PDF/);
 await assert.rejects(()=>extractTABBATADocuments([{name:"empty.txt",data_base64:base64("  \n  ")}]),/contains no extractable text/);
});
test("upload count and file size limits are enforced before extraction",async()=>{
 assert.equal(TABBATA_UPLOAD_LIMITS.files,5);
 assert.equal(TABBATA_UPLOAD_LIMITS.perFileBytes,2*1024*1024);
 await assert.rejects(()=>extractTABBATADocuments([]),/between 1 and 5/);
 const huge=Buffer.alloc(TABBATA_UPLOAD_LIMITS.perFileBytes+1,65).toString("base64");
 await assert.rejects(()=>extractTABBATADocuments([{name:"large.txt",data_base64:huge}]),/oversized|2 MiB/);
});
