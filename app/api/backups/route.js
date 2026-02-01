import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';

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

export async function GET() {
    try {
        // 認証チェック
        const cookieStore = await cookies();
        const session = await getIronSession(cookieStore, SESSION_OPTIONS);

        if (!session.isLoggedIn) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ディレクトリ確認
        try {
            await fs.access(BACKUP_DIR);
        } catch {
            return NextResponse.json({ backups: [] });
        }

        // ファイル一覧取得
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

        // 詳細情報取得
        const backups = await Promise.all(backupFiles.map(async (filename) => {
            const filepath = path.join(BACKUP_DIR, filename);
            const stats = await fs.stat(filepath);

            return {
                id: filename,
                filename: filename,
                createdAt: stats.birthtime.toISOString(), // 作成日時
                size: stats.size,
                path: filepath
            };
        }));

        // 新しい順にソート
        backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({ backups });

    } catch (error) {
        console.error('Failed to list backups:', error);
        return NextResponse.json({ error: 'Failed to list backups' }, { status: 500 });
    }
}
