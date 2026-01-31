// 初期データをVercel KVにアップロードするスクリプト
import dotenv from 'dotenv';
import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.localを読み込む
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const CONTENT_KEY = 'site:content';

async function uploadInitialData() {
    try {
        console.log('Reading content.json...');
        const contentPath = path.join(process.cwd(), 'data', 'content.json');
        const data = await fs.readFile(contentPath, 'utf8');
        const content = JSON.parse(data);

        console.log('Uploading to Vercel KV...');
        await kv.set(CONTENT_KEY, content);

        console.log('✅ Initial data uploaded successfully!');
        console.log('Data:', JSON.stringify(content, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error uploading initial data:', error);
        process.exit(1);
    }
}

uploadInitialData();
