'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getIronSession } from 'iron-session';
import { saveContent as saveContentToFile } from '../lib/utils';
import { SESSION_OPTIONS } from '../lib/session';

export async function login(prevState, formData) {
    const password = formData.get('password');
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';

    if (password !== adminPassword) {
        return { error: 'Invalid password' };
    }

    // セッション作成
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);

    session.isLoggedIn = true;
    session.lastActivity = Date.now();
    await session.save();

    // useActionStateと互換性のため、successフラグを返す
    return { success: true };
}

export async function logout() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);

    session.destroy();
    redirect('/admin/login');
}

export async function savePageContent(section, data) {
    // ミドルウェアで認証済みのため、ここでのチェックは不要

    // Read current content, update section, write back
    // Note: ideally we read, patch, write. 
    // For simplicity assuming we get the full new content object for the section or we let the utils handle it.
    // Actually utils.saveContent writes the WHOLE file.
    // So we need to read it here first or trust the client sent the whole structure?
    // Safer to read here.

    const { getContent } = await import('../lib/utils');
    const currentContent = await getContent();

    if (!currentContent) return { error: 'Failed to read content' };

    const newContent = {
        ...currentContent,
        [section]: data
    };

    const success = await saveContentToFile(newContent);
    if (!success) return { error: 'Failed to save' };

    // キャッシュを無効化して最新データを表示させる
    revalidatePath(`/${section}`); // ex: /makes, /skills
    revalidatePath('/'); // Home page might display summary
    revalidatePath('/admin'); // Admin pages

    return { success: true };
}
