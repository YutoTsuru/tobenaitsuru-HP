import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import BackupsClient from './BackupsClient';

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

export default async function BackupsPage() {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);

    if (!session.isLoggedIn) {
        redirect('/admin/login');
    }

    return <BackupsClient />;
}
