import styles from './page.module.css';

export default function AdminDashboard() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Dashboard</h1>
            <p>Welcome to the Content Management System.</p>
            <p>Select "Pages" to edit site content or "Works" to manage your portfolio items.</p>
        </div>
    );
}
