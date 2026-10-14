import fs from 'node:fs';
import path from 'node:path';

const fontsDir = path.resolve('assets/fonts');
fs.mkdirSync(fontsDir, { recursive: true });

async function getFonts() {
  const cssUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&family=Sora:wght@600;800&display=swap';
  console.log('Fetching Google Fonts stylesheet...');
  const res = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  const cssText = await res.text();

  const blocks = cssText.split('@font-face').slice(1);
  let localCss = '/* Self-hosted fonts for AK Digital Studio */\n';
  let fontIdx = 0;

  for (const block of blocks) {
    const familyMatch = block.match(/font-family:\s*['"]?([^'";]+)['"]?/);
    const weightMatch = block.match(/font-weight:\s*([0-9]+)/);
    const styleMatch = block.match(/font-style:\s*([a-z]+)/);
    const urlMatch = block.match(/src:\s*url\((https:[^)]+)\)/);
    const rangeMatch = block.match(/unicode-range:\s*([^;]+);/);

    if (familyMatch && weightMatch && urlMatch) {
      const family = familyMatch[1].trim();
      const weight = weightMatch[1].trim();
      const style = styleMatch ? styleMatch[1].trim() : 'normal';
      const remoteUrl = urlMatch[1].trim();
      const range = rangeMatch ? rangeMatch[1].trim() : '';

      fontIdx++;
      const safeFamily = family.toLowerCase().replace(/\s+/g, '-');
      const filename = `${safeFamily}-${weight}${style === 'italic' ? '-italic' : ''}-${fontIdx}.woff2`;
      const filepath = path.join(fontsDir, filename);

      console.log(`Downloading font: ${filename} from ${remoteUrl}`);
      const fontRes = await fetch(remoteUrl);
      const buffer = Buffer.from(await fontRes.arrayBuffer());
      fs.writeFileSync(filepath, buffer);

      localCss += `@font-face {\n`;
      localCss += `  font-family: '${family}';\n`;
      localCss += `  font-style: ${style};\n`;
      localCss += `  font-weight: ${weight};\n`;
      localCss += `  font-display: swap;\n`;
      localCss += `  src: url('/fonts/${filename}') format('woff2');\n`;
      if (range) {
        localCss += `  unicode-range: ${range};\n`;
      }
      localCss += `}\n\n`;
    }
  }

  fs.mkdirSync('assets/css', { recursive: true });
  fs.writeFileSync('assets/css/fonts.css', localCss);
  console.log('Successfully saved fonts in assets/fonts/ and written assets/css/fonts.css');
}

getFonts().catch(err => {
  console.error('Error fetching fonts:', err);
  process.exit(1);
});
