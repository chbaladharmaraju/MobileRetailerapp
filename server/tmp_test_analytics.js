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
    console.log('Success! Received analytics data summary:');
    console.log(JSON.stringify(analyticsData.summary, null, 2));
    
    const trends = analyticsData.salesTrend?.length || 0;
    console.log(`Received ${trends} periods of trend data.`);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAnalytics();
