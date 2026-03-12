const puppeteer = require('puppeteer');

async function testDashboardRender() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a standard desktop size
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    
    // Login as the test user that has no data
    console.log('Logging in as testuser1...');
    await page.type('input[placeholder="Enter your email"]', 'testuser1@gmail.com');
    await page.type('input[placeholder="Enter your password"]', 'password123');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for dashboard to render...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Give charts and Framer Motion a moment to animate
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Taking screenshot of the empty state dashboard...');
    await page.screenshot({ path: 'dashboard_empty_state_fix.png' });
    
    // Now log out and log in as Admin
    console.log('Logging out...');
    await page.click('button:has-text("Logout"), a:has-text("Logout"), .lucide-log-out'); // Attempt generic logout selectors if present
    // Fallback if UI logout doesn't work easily via simple selectors: clear localStorage and reload
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

    console.log('Logging in as admin...');
    await page.type('input[placeholder="Enter your email"]', 'admin@antigravity.com');
    await page.type('input[placeholder="Enter your password"]', 'password');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for admin dashboard to render...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));
    
    console.log('Taking screenshot of the admin dashboard...');
    await page.screenshot({ path: 'dashboard_admin_state_fix.png', fullPage: true });
    
    console.log('Done! Screenshots saved.');

  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
}

testDashboardRender();
