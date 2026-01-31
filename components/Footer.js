import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <p className={styles.copy}>&copy; {new Date().getFullYear()} Tobenaitsuru. All rights reserved.</p>
            </div>
        </footer>
    );
}
