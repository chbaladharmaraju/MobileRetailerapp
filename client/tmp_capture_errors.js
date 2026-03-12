const puppeteer = require('puppeteer');

async function getConsoleErrors() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Attempt to login to reach dashboard
    await page.type('input[placeholder="Enter your email"]', 'testuser1@gmail.com');
    await page.type('input[placeholder="Enter your password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('Successfully navigated to dashboard. Waiting 2 seconds for render...');
    await new Promise(r => setTimeout(r, 2000));
    
  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
}

getConsoleErrors();
