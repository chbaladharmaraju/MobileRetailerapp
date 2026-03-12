const fs = require('fs');

async function testAnalytics() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser1@gmail.com', password: 'password123' })
    });
    
    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const analyticsRes = await fetch('http://localhost:5000/api/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!analyticsRes.ok) {
      const errText = await analyticsRes.text();
      throw new Error(`Analytics failed: ${analyticsRes.status} ${errText}`);
    }
    
    const analyticsData = await analyticsRes.json();
    console.log('Success! Writing analytics data to out.json');
    fs.writeFileSync('out.json', JSON.stringify(analyticsData, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAnalytics();
