import test from "node:test";
import assert from "node:assert/strict";
import {extractTABBATADocuments,parseCsv,TABBATA_UPLOAD_LIMITS} from "../tabbata-documents.mjs";

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
 assert.equal(docs[0].id,"doc-1");
 assert.equal(docs[1].id,"doc-2");
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
