import path from "node:path";

export const TABBATA_UPLOAD_LIMITS=Object.freeze({
  files:5, perFileBytes:2*1024*1024, totalBytes:8*1024*1024,
  charsPerDocument:12000, charsPerCase:40000, segmentsPerDocument:80
});

const EXTENSIONS=new Set([".pdf",".docx",".xlsx",".csv",".txt",".md"]);
const BASE64=/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function safeName(value){
  if(typeof value!=="string")throw new Error("Every uploaded file needs a filename.");
  const name=path.basename(value.split(String.fromCharCode(92)).join("/")).replace(/[\u0000-\u001f\u007f]/g,"").trim().slice(0,120);
  if(!name||name==="."||name==="..")throw new Error("A filename is invalid.");
  return name;
}
function decodeFile(value){
  if(typeof value!=="string"||value.length<4||value.length>Math.ceil(TABBATA_UPLOAD_LIMITS.perFileBytes*4/3)+8||!BASE64.test(value))
    throw new Error("A file has invalid or oversized base64 data.");
  const bytes=Buffer.from(value,"base64");
  if(!bytes.length||bytes.toString("base64")!==value)throw new Error("A file has invalid base64 encoding.");
  if(bytes.length>TABBATA_UPLOAD_LIMITS.perFileBytes)throw new Error("Each file must be 2 MiB or smaller.");
  return bytes;
}
function decodeText(bytes){
  try{return new TextDecoder("utf-8",{fatal:true}).decode(bytes);}
  catch{throw new Error("A text document is not valid UTF-8. Save it as UTF-8 and upload again.");}
}
function cleanText(value){
  return String(value??"").replace(/\u0000/g,"").replace(/\r\n?/g,"\n").trim();
}
function splitSegments(documentId,entries){
  const segments=[];let used=0;let truncated=false;
  for(const entry of entries){
    const text=cleanText(entry.text);
    if(!text)continue;
    const remaining=TABBATA_UPLOAD_LIMITS.charsPerDocument-used;
    if(remaining<=0){truncated=true;break;}
    const bounded=text.slice(0,remaining);
    if(bounded.length<text.length)truncated=true;
    for(let offset=0;offset<bounded.length;offset+=1500){
      if(segments.length>=TABBATA_UPLOAD_LIMITS.segmentsPerDocument){truncated=true;break;}
      const part=bounded.slice(offset,offset+1500);
      const suffix=bounded.length>1500?" · part "+(Math.floor(offset/1500)+1):"";
      const segment={id:documentId+"-s"+(segments.length+1),locator:String(entry.locator).slice(0,100)+suffix,text:part};
      if(offset===0&&entry.cells&&typeof entry.cells==="object"&&!Array.isArray(entry.cells)){
        segment.cells=Object.fromEntries(Object.entries(entry.cells).slice(0,40).map(([key,value])=>[String(key).slice(0,100),String(value??"").slice(0,1000)]));
      }
      segments.push(segment);
      used+=part.length;
    }
    if(truncated||segments.length>=TABBATA_UPLOAD_LIMITS.segmentsPerDocument)break;
  }
  return {segments,chars:used,truncated};
}
function parseCsv(text){
  const rows=[];let row=[];let field="";let quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(quoted){
      if(ch==='"'&&text[i+1]==='"'){field+='"';i++;}
      else if(ch==='"')quoted=false;
      else field+=ch;
    }else if(ch==='"'&&field.length===0)quoted=true;
    else if(ch===","){row.push(field);field="";}
    else if(ch==="\n"){row.push(field);rows.push(row);row=[];field="";}
    else if(ch==="\r"){if(text[i+1]==="\n")i++;row.push(field);rows.push(row);row=[];field="";}
    else field+=ch;
    if(rows.length>2001)throw new Error("A CSV file may contain at most 2,000 data rows.");
  }
  if(quoted)throw new Error("A CSV file contains an unclosed quoted field.");
  if(field.length||row.length){row.push(field);rows.push(row);}
  return rows.filter(cells=>cells.some(cell=>String(cell).trim()));
}
function cellText(value){
  if(value===null||value===undefined)return "";
  if(value instanceof Date)return value.toISOString();
  if(typeof value==="string"||typeof value==="number"||typeof value==="boolean")return String(value);
  if(typeof value==="object"){
    if(Array.isArray(value.richText))return value.richText.map(x=>x.text??"").join("");
    if(typeof value.text==="string")return value.text;
    if(Object.hasOwn(value,"formula")||Object.hasOwn(value,"sharedFormula"))return "[formula cell not evaluated]";
    if(Object.hasOwn(value,"error"))return "[spreadsheet error cell]";
    return "";
  }
  return "";
}
function uniqueHeaders(values){
  const counts=new Map();
  return values.map((value,index)=>{
    const base=cellText(value).trim()||"Column "+(index+1);
    const count=(counts.get(base)??0)+1;
    counts.set(base,count);
    return count>1?base+" ("+count+")":base;
  });
}
function inspectOfficeZip(bytes,requiredEntry){
  const minimum=Math.max(0,bytes.length-65557);let eocd=-1;
  for(let offset=bytes.length-22;offset>=minimum;offset--){
    if(bytes.readUInt32LE(offset)===0x06054b50){eocd=offset;break;}
  }
  if(eocd<0)throw new Error("The Office file has an invalid ZIP container.");
  const entries=bytes.readUInt16LE(eocd+10);
  const centralSize=bytes.readUInt32LE(eocd+12);
  const centralOffset=bytes.readUInt32LE(eocd+16);
  if(entries>2000||centralOffset+centralSize>eocd||centralOffset>bytes.length)
    throw new Error("The Office file has an invalid or oversized archive directory.");
  let offset=centralOffset,totalExpanded=0,found=false;
  for(let index=0;index<entries;index++){
    if(offset+46>bytes.length||bytes.readUInt32LE(offset)!==0x02014b50)
      throw new Error("The Office file has an invalid ZIP entry.");
    const compressed=bytes.readUInt32LE(offset+20);
    const expanded=bytes.readUInt32LE(offset+24);
    const nameLength=bytes.readUInt16LE(offset+28);
    const extraLength=bytes.readUInt16LE(offset+30);
    const commentLength=bytes.readUInt16LE(offset+32);
    const end=offset+46+nameLength+extraLength+commentLength;
    if(end>bytes.length||compressed===0xffffffff||expanded===0xffffffff)
      throw new Error("ZIP64 or malformed Office archives are not supported.");
    const name=bytes.subarray(offset+46,offset+46+nameLength).toString("utf8");
    if(name.startsWith("/")||name.includes(String.fromCharCode(92))||name.split("/").includes(".."))
      throw new Error("The Office archive contains an unsafe entry path.");
    if(expanded>10*1024*1024||(compressed===0&&expanded>0)||(compressed>0&&expanded/compressed>100))
      throw new Error("The Office archive contains an oversized or highly compressed entry.");
    totalExpanded+=expanded;
    if(totalExpanded>30*1024*1024)throw new Error("The Office archive expands beyond the safe extraction limit.");
    if(name===requiredEntry)found=true;
    offset=end;
  }
  if(!found)throw new Error("The Office file is missing its required document structure.");
}
async function extractPdf(bytes){
  const {getDocument}=await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task=getDocument({data:new Uint8Array(bytes),disableFontFace:true,useSystemFonts:true,isEvalSupported:false});
  const pdf=await task.promise;
  const entries=[];
  try{
    if(pdf.numPages>80)throw new Error("A PDF may contain at most 80 pages.");
    for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
      const page=await pdf.getPage(pageNumber);
      const content=await page.getTextContent();
      const text=content.items.map(item=>typeof item.str==="string"?item.str:"").filter(Boolean).join(" ");
      if(text.trim())entries.push({locator:"Page "+pageNumber,text});
    }
  }finally{await pdf.destroy();}
  if(!entries.length)throw new Error("This PDF has no selectable text. Scanned-image OCR is not supported yet.");
  return entries;
}
async function extractDocx(bytes){
  const module=await import("mammoth");
  const mammoth=module.default??module;
  const result=await mammoth.extractRawText({buffer:bytes});
  const entries=result.value.split(/\n\s*\n/).map((text,index)=>({locator:"Paragraph "+(index+1),text}));
  if(!entries.some(x=>x.text.trim()))throw new Error("No readable text was found in this DOCX.");
  return entries;
}
async function extractXlsx(bytes){
  const module=await import("exceljs");
  const ExcelJS=module.default??module;
  const workbook=new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes);
  if(workbook.worksheets.length>10)throw new Error("An XLSX file may contain at most 10 worksheets.");
  const entries=[];
  for(const sheet of workbook.worksheets){
    const headerRow=sheet.getRow(1);
    const headers=uniqueHeaders(headerRow.values.slice(1));
    let rows=0;
    sheet.eachRow({includeEmpty:false},(row,rowNumber)=>{
      if(rowNumber===1)return;
      if(++rows>1000)throw new Error("Each worksheet may contain at most 1,000 data rows.");
      const cells=row.values.slice(1);
      const cellMap=Object.fromEntries(headers.map((label,index)=>[label,cellText(cells[index]).trim()]));
      const parts=headers.map(label=>{
        const text=cellMap[label];
        return text?label+": "+text:"";
      }).filter(Boolean);
      if(parts.length)entries.push({locator:"Sheet "+sheet.name+" · Row "+rowNumber,text:parts.join(" | "),cells:cellMap});
    });
  }
  if(!entries.length)throw new Error("No non-empty data rows were found in this XLSX.");
  return entries;
}
async function extractCsv(bytes){
  const rows=parseCsv(decodeText(bytes));
  if(rows.length<2)throw new Error("A CSV needs a header row and at least one data row.");
  const headers=uniqueHeaders(rows[0]);
  return rows.slice(1).map((cells,index)=>{
    const cellMap=Object.fromEntries(headers.map((header,column)=>[header,String(cells[column]??"").trim()]));
    return {
      locator:"Row "+(index+2),
      text:headers.map(header=>cellMap[header]?header+": "+cellMap[header]:"").filter(Boolean).join(" | "),
      cells:cellMap
    };
  }).filter(row=>row.text);
}

export async function extractTABBATADocuments(files){
  if(!Array.isArray(files)||files.length<1||files.length>TABBATA_UPLOAD_LIMITS.files)
    throw new Error("Upload between 1 and 5 supporting documents.");
  let totalBytes=0,totalChars=0;
  const documents=[];
  for(let index=0;index<files.length;index++){
    const file=files[index];
    const name=safeName(file?.name);
    const extension=path.extname(name).toLowerCase();
    if(!EXTENSIONS.has(extension))throw new Error("Unsupported file type: "+extension+". Use PDF, DOCX, XLSX, CSV, TXT or Markdown.");
    const bytes=decodeFile(file?.data_base64);
    totalBytes+=bytes.length;
    if(totalBytes>TABBATA_UPLOAD_LIMITS.totalBytes)throw new Error("All supporting documents combined must be 8 MiB or smaller.");
    if(extension===".pdf"&&!bytes.subarray(0,5).equals(Buffer.from("%PDF-")))throw new Error(name+" does not appear to be a PDF.");
    if((extension===".docx"||extension===".xlsx")&&!(bytes[0]===0x50&&bytes[1]===0x4b))throw new Error(name+" does not appear to be a valid Office Open XML file.");
    if(extension===".docx")inspectOfficeZip(bytes,"word/document.xml");
    if(extension===".xlsx")inspectOfficeZip(bytes,"xl/workbook.xml");
    let entries;
    if(extension===".pdf")entries=await extractPdf(bytes);
    else if(extension===".docx")entries=await extractDocx(bytes);
    else if(extension===".xlsx")entries=await extractXlsx(bytes);
    else if(extension===".csv")entries=await extractCsv(bytes);
    else{
      const text=decodeText(bytes);
      entries=text.split(/\n/).map((line,lineIndex)=>({locator:"Line "+(lineIndex+1),text:line}));
    }
    const id="doc-"+(index+1);
    const parsed=splitSegments(id,entries);
    if(!parsed.segments.length)throw new Error(name+" contains no extractable text.");
    totalChars+=parsed.chars;
    if(totalChars>TABBATA_UPLOAD_LIMITS.charsPerCase)throw new Error("Extracted text across all files exceeds the 40,000-character review limit.");
    documents.push({
      id,name,kind:extension.slice(1),size_bytes:bytes.length,
      segments:parsed.segments,extracted_chars:parsed.chars,truncated:parsed.truncated
    });
  }
  return documents;
}

export {parseCsv};
