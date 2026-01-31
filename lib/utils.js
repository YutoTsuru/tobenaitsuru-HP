import fs from 'fs/promises';
import path from 'path';

const contentPath = path.join(process.cwd(), 'data', 'content.json');

export async function getContent() {
    try {
        const data = await fs.readFile(contentPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading content.json:', error);
        return null;
    }
}

export async function saveContent(newContent) {
    try {
        await fs.writeFile(contentPath, JSON.stringify(newContent, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing content.json:', error);
        return false;
    }
}
