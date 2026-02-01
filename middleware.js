import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

const SESSION_OPTIONS = {
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

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // ログインページは除外
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // セッション確認
    const response = NextResponse.next();
    const session = await getIronSession(request, response, SESSION_OPTIONS);

    // 未認証の場合
    if (!session.isLoggedIn) {
        const url = new URL('/admin/login', request.url);
        return NextResponse.redirect(url);
    }

    // タイムアウトチェック（30分非アクティブ）
    const now = Date.now();
    const lastActivity = session.lastActivity || 0;
    const timeout = 30 * 60 * 1000; // 30分

    if (now - lastActivity > timeout) {
        // タイムアウト
        session.destroy();
        const url = new URL('/admin/login?timeout=true', request.url);
        return NextResponse.redirect(url);
    }

    // 最終アクセス時刻を更新
    session.lastActivity = now;
    await session.save();

    return response;
}

export const config = {
    matcher: '/admin/:path*'
};
