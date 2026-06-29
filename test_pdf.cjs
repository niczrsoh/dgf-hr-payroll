const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function test(pdfPath) {
  console.log("Reading PDF:", pdfPath);
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  console.log("Pages:", pdf.numPages);
  
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  console.log("Items:", content.items.length);
  if (content.items.length > 0) {
    console.log("First 10 items:", content.items.slice(0, 10).map(i => i.str).join(' | '));
  }
}

test('/Users/nicholassoh/Downloads/Website/DGF Sdn Bhd (1)/SOCSO CONTRIBUTION TABLE.pdf').catch(console.error);
