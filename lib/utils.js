import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_KEY = 'site:content';
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// 初期データ（KVが空の場合のデフォルト）
const defaultContent = {
    "home": {
        "title": "Tobenaitsuru",
        "subtitle": "Thinking, Designing, Making"
    },
    "about": {
        "title": "About Me",
        "content": "ものづくりに興味があり、日々技術を磨いています。無機質な機械と有機的な思考の融合を目指しています。",
        "profile": "Software Engineer / Designer"
    },
    "skills": {
        "title": "My Skills",
        "items": [
            {
                "name": "JavaScript/React/Next.js",
                "level": "Advanced"
            },
            {
                "name": "Python",
                "level": "Intermediate"
            },
            {
                "name": "Design",
                "level": "Intermediate"
            }
        ]
    },
    "works": {
        "title": "Works",
        "status": "Coming Soon",
        "items": []
    },
    "contact": {
        "title": "Contact",
        "email": "contact@example.com",
        "github": "https://github.com/example",
        "twitter": "https://twitter.com/example"
    }
};

export async function getContent() {
    try {
        const content = await kv.get(CONTENT_KEY);

        // KVにデータがない場合はデフォルトを返す
        if (!content) {
            console.log('No content in KV, using defaults');
            return defaultContent;
        }

        return content;
    } catch (error) {
        console.error('Error reading from KV:', error);
        return defaultContent;
    }
}

export async function saveContent(newContent) {
    try {
        // 1. KVに保存
        await kv.set(CONTENT_KEY, newContent);

        // 2. 自動バックアップを作成
        await createBackup(newContent);

        return true;
    } catch (error) {
        console.error('Error writing to KV or creating backup:', error);
        return false;
    }
}

async function createBackup(content) {
    try {
        // バックアップディレクトリが存在しない場合は作成
        try {
            await fs.access(BACKUP_DIR);
        } catch {
            await fs.mkdir(BACKUP_DIR, { recursive: true });
        }

        // タイムスタンプ付きファイル名を生成 (ex: backup-20240201-123456.json)
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.json`;
        const filepath = path.join(BACKUP_DIR, filename);

        // ファイルに書き込み
        await fs.writeFile(filepath, JSON.stringify(content, null, 2), 'utf8');
        console.log(`Backup created: ${filename}`);

        // 古いバックアップの削除（オプション: 最新30件を残す）
        await cleanupOldBackups();

    } catch (error) {
        console.error('Backup creation failed:', error);
        // バックアップ失敗はメイン処理のエラーとしない（ログのみ）
    }
}

async function cleanupOldBackups() {
    try {
        const files = await fs.readdir(BACKUP_DIR);
        const backupFiles = files.filter(f => f.startsWith('backup-') && f.endsWith('.json'));

        if (backupFiles.length <= 30) return;

        // 新しい順にソート（辞書順降順≒日付順降順）
        backupFiles.sort((a, b) => b.localeCompare(a));

        // 31件目以降を削除
        const filesToDelete = backupFiles.slice(30);
        for (const file of filesToDelete) {
            await fs.unlink(path.join(BACKUP_DIR, file));
            console.log(`Deleted old backup: ${file}`);
        }
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
}
