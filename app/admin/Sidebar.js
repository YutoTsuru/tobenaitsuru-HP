'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';

export default function Sidebar({ logout }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button className={styles.hamburger} onClick={toggleSidebar} aria-label="Toggle Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>CMS</div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navLink} onClick={closeSidebar}>
                        Dashboard
                    </Link>
                    <Link href="/admin/edit/about" className={styles.navLink} onClick={closeSidebar}>
                        About
                    </Link>
                    <Link href="/admin/edit/skills" className={styles.navLink} onClick={closeSidebar}>
                        Skills
                    </Link>
                    <Link href="/admin/edit/contact" className={styles.navLink} onClick={closeSidebar}>
                        Contact
                    </Link>
                    <Link href="/admin/edit/works" className={styles.navLink} onClick={closeSidebar}>
                        Works
                    </Link>
                </nav>
                <form action={logout} className={styles.logoutForm}>
                    <button type="submit" className={styles.logoutBtn}>Logout</button>
                </form>
            </aside>

            {isOpen && <div className={styles.overlay} onClick={closeSidebar}></div>}
        </>
    );
}
