const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function run() {
  const doc = await pdfjsLib.getDocument('SOCSO CONTRIBUTION TABLE.pdf').promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  console.log(content.items.slice(0, 50).map(i => i.str).join(' '));
}
run().catch(console.error);
