// browser.js

const fs = require('fs');
const puppeteer = require('puppeteer');

async function scrapPage(url, outputFile) {
  // Launch a headless browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Visit the URL
  await page.goto(url);
  
  // Scrape the content
  const content = await page.content();
  
  // Write the content to a file
  fs.writeFileSync(outputFile, content);
  
  // Close the browser
  await browser.close();
}

module.exports = {
  scrapPage
};
