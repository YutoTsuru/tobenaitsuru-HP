import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../../actions';
import styles from './layout.module.css';

export default async function AdminLayout({ children }) {
    // Very basic route protection
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    // We need to handle the login page itself not being protected, 
    // but this layout wraps /admin, including /admin/login? 
    // No, usually login is separate or we handle checking conditionally.
    // Actually, standard Next.js Layout wraps all children. 
    // If we are at /admin/login, we shouldn't redirect to /admin/login.
    // Ideally, Middleware is best for this.
    // For now, I'll just check if we are NOT on the login page in the children? 
    // No, Layout doesn't know the path easily in Server Component without headers hack.
    // Better approach: Make /admin/login have its OWN layout or just don't protect it here?
    // Or, simple Hack: Check if we are logged in. If NOT, and we render, we might show a "Not Authorized" or redirect?
    // But wait, if I put this check in AdminLayout, it runs for /admin/login too.
    // So /admin/login will redirect to /admin/login => Infinite Loop.

    // FIX: Move /admin/login OUT of this layout? 
    // Or: Just let the pages protect themselves?
    // Or: Use Group Routes! (admin)/(protected)/layout.js vs (admin)/login/page.js

    // Since I already created the path /admin/login, I'll stick to that.
    // I will make the Layout simple (just UI) and let pages or middleware handle auth.
    // OR, I'll allow the layout to render, but the Sidebar only shows if logged in?
    // Actually, I'll use a specific Client Component Wrapper for protection?
    // Let's go with: Page-level check for the Dashboard and Edit pages. Login page doesn't check.

    return (
        <div className={styles.adminContainer}>
            {isLoggedIn && (
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>CMS</div>
                    <nav className={styles.nav}>
                        <Link href="/admin" className={styles.navLink}>Dashboard</Link>
                        <Link href="/admin/pages" className={styles.navLink}>Pages</Link>
                        <Link href="/admin/works" className={styles.navLink}>Works</Link>
                    </nav>
                    <form action={logout} className={styles.logoutForm}>
                        <button type="submit" className={styles.logoutBtn}>Logout</button>
                    </form>
                </aside>
            )}
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
