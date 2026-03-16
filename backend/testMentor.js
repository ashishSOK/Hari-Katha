const fetch = require('node-fetch');

async function checkMentorFlow() {
  try {
    console.log('--- Registering Mentor ---');
    const mentorRes = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'guru_ji2', 
        password: 'password123',
        role: 'mentor',
        isMentorKey: 'mentor123' 
      })
    });
    const mentorData = await mentorRes.json();
    console.log('Mentor Registration:', mentorRes.ok ? 'Success' : mentorData.message);

    console.log('\n--- Registering Member ---');
    const memberRes = await fetch('http://localhost:5001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'seeker2', 
        password: 'password123',
        role: 'member'
      })
    });
    const memberData = await memberRes.json();
    let memberToken = memberData.token;
    console.log('Member Registration:', memberRes.ok ? 'Success' : memberData.message);
    
    // If they exist, let's login to get tokens
    let mentorToken = mentorData.token;
    if (!mentorRes.ok) {
      const loginM = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'guru_ji2', password: 'password123' })
      });
      mentorToken = (await loginM.json()).token;
    }
    
    if (!memberRes.ok) {
      const loginMem = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'seeker2', password: 'password123' })
      });
      memberToken = (await loginMem.json()).token;
    }

    console.log('\n--- Member Assigns Mentor ---');
    const assignRes = await fetch('http://localhost:5001/api/users/member/assign', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${memberToken}`
      },
      body: JSON.stringify({ mentorUsername: 'guru_ji2' })
    });
    const assignData = await assignRes.json();
    console.log('Assignment:', assignRes.ok ? 'Success' : assignData.message);

    console.log('\n--- Mentor Uploads Video ---');
    const vidRes = await fetch('http://localhost:5001/api/videos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mentorToken}`
      },
      body: JSON.stringify({
        title: 'Importance of Association',
        url: 'https://www.youtube.com/watch?v=1234567890a',
        category: 'Lectures',
      })
    });
    const vidData = await vidRes.json();
    console.log('Video Upload (Mentor):', vidRes.ok ? 'Success' : vidData.message);

    const vidId = vidData._id;

    if (vidRes.ok) {
      console.log('\n--- Member Watches Video ---');
      const watchRes = await fetch(`http://localhost:5001/api/users/history/${vidId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${memberToken}`
        }
      });
      console.log('Watch Event:', watchRes.ok ? 'Success' : await watchRes.json());
    }

    console.log('\n--- Mentor Views Dashboard ---');
    const dashRes = await fetch('http://localhost:5001/api/users/mentor/members', {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${mentorToken}`
      }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard Data Contains Members:', dashData.length);
    if (dashData.length > 0) {
      console.log('First Member History Length:', dashData[0].watchHistory.length);
    }
    
  } catch (error) {
    console.error('Test Failed:', error);
  }
}

checkMentorFlow();
