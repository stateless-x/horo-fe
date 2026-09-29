import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../public/assets/currency');
const sizes = [24, 32, 48, 64, 96, 128, 256, 512];
const customSource = process.argv[2];
const customName = process.argv[3];
if (customSource && !customName) throw new Error('Provide an output asset name with the source path.');

for (const name of customSource ? [customName] : ['mu-gem-clay', 'generation-credit-clay']) {
  for (const size of sizes) {
    const source = () => sharp(customSource || resolve(root, `${name}-master.png`)).resize(size, size);
    await source().png().toFile(resolve(root, `${name}-${size}.png`));
    await source().webp({ lossless: true }).toFile(resolve(root, `${name}-${size}.webp`));
  }
}
console.log('Exported transparent currency PNG/WebP assets in eight sizes.');
