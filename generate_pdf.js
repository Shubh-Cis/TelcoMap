const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mdPath = path.join(__dirname, 'HOW_TO_RUN.md');
const pdfPath = path.join(__dirname, 'HOW_TO_RUN.pdf');
const tempHtmlPath = path.join(__dirname, 'temp_print.html');

console.log('Reading Markdown content...');
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Convert Markdown to HTML using marked via npx
const htmlBody = execSync('npx -y marked -i HOW_TO_RUN.md', { cwd: __dirname }).toString();

const styledHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Telecom Network Platform - Operations Guide</title>
  <style>
    @page {
      margin: 20mm 15mm 20mm 15mm;
      size: A4 portrait;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 20pt;
      color: #0f172a;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 8px;
    }
    h2 {
      font-size: 14pt;
      color: #0369a1;
      margin-top: 4px;
      margin-bottom: 16px;
    }
    h3 {
      font-size: 13pt;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 10px;
    }
    h4 {
      font-size: 11pt;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    p {
      margin-top: 0;
      margin-bottom: 10px;
    }
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 9pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px;
      border-radius: 6px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 8.5pt;
      line-height: 1.4;
      overflow-x: auto;
      margin-top: 6px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 16px;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
    }
    hr {
      border: 0;
      border-top: 1px solid #e2e8f0;
      margin: 20px 0;
    }
    a {
      color: #0284c7;
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

fs.writeFileSync(tempHtmlPath, styledHtml);
console.log('Generated temporary styled HTML. Invoking Chrome headless print...');

execSync(`google-chrome --headless=new --disable-gpu --no-sandbox --print-to-pdf="${pdfPath}" "${tempHtmlPath}"`, {
  stdio: 'inherit',
});

fs.unlinkSync(tempHtmlPath);
console.log(`Successfully created PDF: ${pdfPath}`);
