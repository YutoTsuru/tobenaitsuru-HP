import { cookies } from 'next/headers';
import { logout } from '../actions';
import Sidebar from './Sidebar';
import styles from './layout.module.css';
import { getIronSession } from 'iron-session';
import { SESSION_OPTIONS } from '../../lib/session';

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, SESSION_OPTIONS);
    const isLoggedIn = session.isLoggedIn === true;

    return (
        <div className={styles.adminContainer}>
            {isLoggedIn && <Sidebar logout={logout} />}
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
