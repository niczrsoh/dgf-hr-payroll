import * as pdfjsLib from 'pdfjs-dist';

async function run() {
  const doc = await pdfjsLib.getDocument('SOCSO CONTRIBUTION TABLE.pdf').promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  console.log(content.items.slice(0, 100).map(i => i.str).join(' | '));
}
run().catch(console.error);
