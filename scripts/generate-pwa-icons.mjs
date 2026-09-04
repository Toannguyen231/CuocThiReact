import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const logoPath = path.join(publicDir, 'logo.png');

async function generateIcons() {
  console.log('--- Đang tạo icons cho PWA Chiếu Nẫu ---');
  console.log('Source logo:', logoPath);

  const metadata = await sharp(logoPath).metadata();
  console.log(`Logo gốc: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

  // Màu nền thương hiệu theo biến CSS: --cream-light (#faf7f2) hoặc --primary (#2d5a2d)
  // Dùng nền #faf7f2 để logo hài hòa và an toàn cho maskable icon
  const bgColor = '#faf7f2';

  // 1. pwa-192x192.png
  // Với kích thước 192x192, resize logo và đặt giữa nền an toàn
  const logo192 = await sharp(logoPath)
    .resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: bgColor
    }
  })
    .composite([{ input: logo192, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✔ Đã tạo: public/pwa-192x192.png');

  // 2. pwa-512x512.png (maskable safe zone: 80% đường kính -> ~400px logo)
  const logo512 = await sharp(logoPath)
    .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: bgColor
    }
  })
    .composite([{ input: logo512, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✔ Đã tạo: public/pwa-512x512.png (maskable ready)');

  // 3. apple-touch-icon.png (180x180)
  const logoApple = await sharp(logoPath)
    .resize(144, 144, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: bgColor
    }
  })
    .composite([{ input: logoApple, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✔ Đã tạo: public/apple-touch-icon.png (180x180)');

  // 4. favicon.ico (hoặc favicon 64x64/32x32)
  await sharp(logoPath)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✔ Đã tạo: public/favicon.ico');

  console.log('🎉 Hoàn tất sinh PWA icons!');
}

generateIcons().catch((err) => {
  console.error('Lỗi khi tạo icons:', err);
  process.exit(1);
});
