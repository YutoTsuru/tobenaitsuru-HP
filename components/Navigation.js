'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Navigation.module.css';

const NAV_ITEMS = [
    { href: '/', label: 'Top' },
    { href: '/about', label: 'About' },
    { href: '/skills', label: 'Skills' },
    { href: '/makes', label: 'Makes' },
    { href: '/contact', label: 'Contact' },
];

function isCurrentPath(pathname, href) {
    if (href === '/') {
        return pathname === '/';
    }
    return pathname.startsWith(href);
}

export default function Navigation() {
    const pathname = usePathname();
    const [isQuickOpen, setIsQuickOpen] = useState(false);

    useEffect(() => {
        setIsQuickOpen(false);
    }, [pathname]);

    return (
        <nav className={styles.nav} aria-label="Primary navigation">
            <ul className={styles.navList}>
                {NAV_ITEMS.map((item) => {
                    const activeClass = isCurrentPath(pathname, item.href) ? styles.navLinkActive : '';
                    return (
                        <li key={item.href}>
                            <Link href={item.href} className={`${styles.navLink} ${activeClass}`.trim()}>
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <button
                type="button"
                className={`${styles.quickToggle} ${isQuickOpen ? styles.quickToggleOpen : ''}`.trim()}
                onClick={() => setIsQuickOpen((prev) => !prev)}
                aria-expanded={isQuickOpen}
                aria-controls="quick-access-panel"
                aria-label={isQuickOpen ? 'Close menu' : 'Open menu'}
            >
                <span className={styles.quickToggleIcon} aria-hidden="true">
                    <span className={`${styles.quickLine} ${styles.quickLine1}`} />
                    <span className={`${styles.quickLine} ${styles.quickLine2}`} />
                    <span className={`${styles.quickLine} ${styles.quickLine3}`} />
                </span>
            </button>

            <div
                id="quick-access-panel"
                className={`${styles.quickPanel} ${isQuickOpen ? styles.quickPanelOpen : ''}`.trim()}
            >
                {NAV_ITEMS.map((item, index) => {
                    const activeClass = isCurrentPath(pathname, item.href) ? styles.quickLinkActive : '';
                    return (
                        <Link
                            key={`quick-${item.href}`}
                            href={item.href}
                            className={`${styles.quickLink} ${activeClass}`.trim()}
                            onClick={() => setIsQuickOpen(false)}
                        >
                            <span className={styles.quickIndex}>{`0${index + 1}`.slice(-2)}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
