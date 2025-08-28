
const http = require('http');
const fs = require('fs');

console.log('🔍 Verifying PermitPro Installation...\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if required files exist
const requiredFiles = [
  'package.json',
  'client/package.json',
  'server/package.json',
  '.env'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check server connectivity
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is responding');
  } else {
    console.log(`❌ Server returned status: ${res.statusCode}`);
  }
});

req.on('error', (err) => {
  console.log(`❌ Server connection failed: ${err.message}`);
});

req.end();

console.log('\n🎉 Installation verification complete!');
