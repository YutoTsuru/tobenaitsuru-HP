import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + '_' + file.name.replaceAll(' ', '_');

        // public/uploads ディレクトリへのパス
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // ディレクトリが存在しない場合は作成
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // エラーは無視（既に存在するなどでエラーになる場合があるため）
        }

        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
