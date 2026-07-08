const http = require('http');

async function test() {
  const loginData = JSON.stringify({ email: 'arabella@gmail.com', password: 'password' });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Login Response:', data);
      const cookies = res.headers['set-cookie'];
      console.log('Cookies:', cookies);

      if (cookies) {
        const profileOpts = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/user/profile',
          method: 'GET',
          headers: { 'Cookie': cookies.join('; ') }
        };
        const pReq = http.request(profileOpts, (pRes) => {
          let pData = '';
          pRes.on('data', (c) => { pData += c; });
          pRes.on('end', () => {
            console.log('Profile Response:', pRes.statusCode, pData);
          });
        });
        pReq.end();
      }
    });
  });

  req.write(loginData);
  req.end();
}

test();
