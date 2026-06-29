import PyPDF2
reader = PyPDF2.PdfReader("/Users/nicholassoh/Downloads/Website/DGF Sdn Bhd (1)/SOCSO CONTRIBUTION TABLE.pdf")
print("Pages:", len(reader.pages))
if len(reader.pages) > 0:
    print("Page 1 Text:", repr(reader.pages[0].extract_text()[:500]))
