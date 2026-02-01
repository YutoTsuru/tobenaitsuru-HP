import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { saveContent } from '../../../../lib/utils'; // 既存の保存関数（KV更新+新規バックアップ）

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

const SESSION_OPTIONS = {
    password: process.env.SESSION_SECRET || 'default-fallback-secret-32-characters-minimum',
    cookieName: 'admin_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 30, // 30 mins
        path: '/admin'
    }
};

export async function POST(request) {
    try {
        // 認証チェック
        const cookieStore = await cookies();
        const session = await getIronSession(cookieStore, SESSION_OPTIONS);

        if (!session.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { filename } = await request.json();

        if (!filename) {
            return NextResponse.json({ error: 'Filename required' }, { status: 400 });
        }

        const filepath = path.join(BACKUP_DIR, filename);

        // ファイル存在確認
        try {
            await fs.access(filepath);
        } catch {
            return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
        }

        // バックアップファイルを読み込み
        const fileContent = await fs.readFile(filepath, 'utf8');
        const content = JSON.parse(fileContent);

        // コンテンツを復元（KVへ保存 + 新しいバックアップ作成）
        // saveContent関数を再利用することで、復元操作自体も新しいバックアップとして記録される
        const success = await saveContent(content);

        if (!success) {
            return NextResponse.json({ error: 'Failed to restore content' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Restored successfully' });

    } catch (error) {
        console.error('Restore failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
