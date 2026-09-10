const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const TARGETS = [
  { dir: path.join(__dirname, 'public/faces'), ext: '.png', animated: false },
  { dir: path.join(__dirname, 'public/facesgifs'), ext: '.gif', animated: true },
  { dir: path.join(__dirname, 'public/gifstexts'), ext: '.gif', animated: true }
];

async function convertAssets() {
  let totalSaved = 0;
  
  for (const target of TARGETS) {
    if (!fs.existsSync(target.dir)) continue;
    
    const files = fs.readdirSync(target.dir).filter(f => f.toLowerCase().endsWith(target.ext));
    
    for (const file of files) {
      const inputPath = path.join(target.dir, file);
      // Case-insensitive replace for .gif and .png
      const outputFilename = file.replace(new RegExp(`\\${target.ext}$`, 'i'), '.webp');
      const outputPath = path.join(target.dir, outputFilename);
      
      const inputSize = fs.statSync(inputPath).size;
      
      try {
        await sharp(inputPath, { animated: target.animated })
          .webp({ quality: 80, effort: 6 })
          .toFile(outputPath);
          
        const outputSize = fs.statSync(outputPath).size;
        const saved = inputSize - outputSize;
        totalSaved += saved;
        
        console.log(`Converted ${file} to WebP. Saved ${(saved / 1024 / 1024).toFixed(2)} MB`);
        
        // Delete old file
        fs.unlinkSync(inputPath);
      } catch (err) {
        console.error(`Error converting ${file}:`, err.message);
      }
    }
  }
  
  console.log(`\nTotal space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB!`);
}

convertAssets().catch(console.error);
