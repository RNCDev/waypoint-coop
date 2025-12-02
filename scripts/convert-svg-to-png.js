const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function convertSvgToPng() {
  const svgFiles = [
    'public/images/waypoint-logo.svg',
    'public/images/waypoint-logo-blue.svg'
  ]

  for (const svgPath of svgFiles) {
    try {
      const svgBuffer = fs.readFileSync(svgPath)
      const pngPath = svgPath.replace('.svg', '.png')
      
      // Convert SVG to PNG with high quality
      // Using density to ensure good quality for text rendering
      await sharp(svgBuffer, { density: 300 })
        .png()
        .toFile(pngPath)
      
      console.log(`✓ Converted ${svgPath} → ${pngPath}`)
    } catch (error) {
      console.error(`✗ Error converting ${svgPath}:`, error.message)
    }
  }
}

convertSvgToPng()
  .then(() => {
    console.log('\nAll conversions complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Conversion failed:', error)
    process.exit(1)
  })

