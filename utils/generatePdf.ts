const puppeteer = require('puppeteer');

const generatePDFFromUrl = async(options:any)=> {

   const {
    html,
    outputPath,
    format = 'A4',
    landscape = false
  } = options;
  // console.log(options)
   const browser = await puppeteer.launch({
    headless: 'new',
     args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    // '--single-process'
  ],
  });
  try{
    const page = await browser.newPage();
    await page.setViewport({
      width: landscape ? 1024 : 768,
      height: landscape ? 768 : 1024,
      deviceScaleFactor: 1 // Higher quality
    });

    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    await Promise.all([
      page.evaluateHandle('document.fonts.ready'),
      page.waitForNetworkIdle({ idleTime: 700 }) // Additional network idle wait
    ]);

    const pdfOptions = {
      path: outputPath,
      format,
      landscape,
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true
    };

    return await page.pdf(pdfOptions);
  }finally{
    await browser.close();
  }
}
export default generatePDFFromUrl


