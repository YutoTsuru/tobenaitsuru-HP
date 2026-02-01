import { cookies } from 'next/headers';
import { logout } from '../actions';
import Sidebar from './Sidebar';
import styles from './layout.module.css';

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    return (
        <div className={styles.adminContainer}>
            {isLoggedIn && <Sidebar logout={logout} />}
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
