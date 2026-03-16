const fs = require('fs');
const { execSync } = require('child_process');
try {
  execSync('npm install -g svgexport');
  execSync('svgexport public/logo.svg public/logo-192x192.png 192:192');
  execSync('svgexport public/logo.svg public/logo-512x512.png 512:512');
  console.log('PNGs created successfully.');
} catch (e) {
  console.error('Failed to convert svg to png', e);
}
