'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { saveContent as saveContentToFile } from '../lib/utils';

export async function login(formData) {
    const password = formData.get('password');

    // Simple hardcoded check
    if (password === 'password') {
        (await cookies()).set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
        });
        redirect('/admin');
    } else {
        return { error: 'Invalid password' };
    }
}

export async function logout() {
    (await cookies()).delete('admin_session');
    redirect('/admin/login');
}

export async function savePageContent(section, data) {
    // Verify auth
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) {
        throw new Error('Unauthorized');
    }

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

    return { success: true };
}
