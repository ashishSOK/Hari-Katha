const https = require('https');
https.get('https://www.youtube.com/watch?v=5FAveDaujV4', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<meta property="og:image" content="(.*?)"/);
    console.log("og:image is", match ? match[1] : 'not found');
  });
});
