export const SESSION_OPTIONS = {
    password: process.env.SESSION_SECRET || 'default-fallback-secret-32-characters-minimum',
    cookieName: 'admin_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 30, // 30 minutes
        path: '/admin'
    }
};
