import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgCode = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" id="HariKathaLogo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     x="0px" y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
<defs>
    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ff6b2b; stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff4b1f; stop-opacity:1" />
    </linearGradient>
    <style>
        .bg { fill: #050505; }
        .text-hari { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            font-weight: 800; 
            font-size: 100px; 
            fill: #f8f9fa; 
            letter-spacing: -3px; 
        }
        .text-katha { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            font-weight: 800; 
            font-size: 100px; 
            fill: url(#primaryGradient); 
            letter-spacing: -3px; 
        }
    </style>
</defs>
<rect x="0" y="0" width="512" height="512" rx="120" ry="120" class="bg" />
<text x="256" y="220" text-anchor="middle" class="text-hari">Hari</text>
<text x="256" y="340" text-anchor="middle" class="text-katha">Katha</text>
</svg>`;

async function generateIcons() {
  try {
    const svgBuffer = Buffer.from(svgCode);
    
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, 'public', 'logo-192x192.png'));
      
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, 'public', 'logo-512x512.png'));
      
    console.log("PNG icons generated successfully.");
  } catch (e) {
    console.error("Error generating icons:", e);
  }
}

generateIcons();
