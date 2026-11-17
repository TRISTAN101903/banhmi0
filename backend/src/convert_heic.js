import convert from 'heic-convert';
import fs from 'fs';
import path from 'path';

const userUploadedDir = 'C:/Users/Admin/.gemini/antigravity/brain/98ece0fc-8efb-410f-a901-25b887c8b1dc/.user_uploaded';

const files = [
  { src: 'media_1794720979821_b5aca7aa.heic', dest: 'uploaded_photo_1.jpg' },
  { src: 'media_1794720978566_9f00512a.heic', dest: 'uploaded_photo_2.jpg' },
  { src: 'media_1794720982098_c823b528.heic', dest: 'uploaded_photo_3.jpg' }
];

async function convertAll() {
  for (const f of files) {
    const inputPath = path.join(userUploadedDir, f.src);
    if (!fs.existsSync(inputPath)) {
      console.log('File does not exist:', inputPath);
      continue;
    }
    console.log('Converting:', f.src, '->', f.dest);
    const inputBuffer = fs.readFileSync(inputPath);
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.92
    });

    const destUpload = path.resolve('uploads/brand', f.dest);
    const destPublic = path.resolve('frontend/public', f.dest);

    fs.writeFileSync(destUpload, Buffer.from(outputBuffer));
    fs.writeFileSync(destPublic, Buffer.from(outputBuffer));
    console.log('Successfully saved to:', destUpload, 'and', destPublic);
  }
}

convertAll().catch(console.error);
