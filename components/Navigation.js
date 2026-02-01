import Link from 'next/link';
import styles from './Navigation.module.css';

export default function Navigation() {
    return (
        <nav className={styles.nav}>
            <ul className={styles.navList}>
                <li><Link href="/" className={styles.navLink}>Top</Link></li>
                <li><Link href="/about" className={styles.navLink}>About</Link></li>
                <li><Link href="/skills" className={styles.navLink}>Skills</Link></li>
                <li><Link href="/makes" className={styles.navLink}>Makes</Link></li>
                <li><Link href="/contact" className={styles.navLink}>Contact</Link></li>
            </ul>
        </nav>
    );
}
