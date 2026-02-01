import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getContent } from '../../../lib/utils';
import Link from 'next/link';
import Gear from '../../../components/Gear';
import styles from './page.module.css';

export default async function Dashboard() {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_session')?.value === 'true';

    if (!isLoggedIn) {
        redirect('/admin/login');
    }

    const content = await getContent();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <Link href="/" className={styles.homeLink}>
                    ← Back to Site
                </Link>
            </div>

            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Gear size={40} duration={8} color="var(--c-accent-1)" />
                        <h2 className={styles.cardTitle}>About</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p><strong>Title:</strong> {content?.about?.title}</p>
                        <p><strong>Profile:</strong> {content?.about?.profile}</p>
                        <p className={styles.contentPreview}>{content?.about?.content}</p>
                    </div>
                    <Link href="/admin/edit/about" className={styles.editButton}>
                        Edit Section
                    </Link>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Gear size={40} duration={15} color="var(--c-accent-2)" />
                        <h2 className={styles.cardTitle}>Skills</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p><strong>Title:</strong> {content?.skills?.title}</p>
                        <p><strong>Items:</strong> {content?.skills?.items?.length || 0} skills</p>
                        <ul className={styles.skillsList}>
                            {content?.skills?.items?.slice(0, 3).map((skill, idx) => (
                                <li key={idx}>{skill.name} - {skill.level}</li>
                            ))}
                        </ul>
                    </div>
                    <div className={styles.comingSoon}>
                        🚧 Edit feature coming soon
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Gear size={40} duration={12} color="var(--c-accent-3)" />
                        <h2 className={styles.cardTitle}>Works</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p><strong>Title:</strong> {content?.works?.title}</p>
                        <p><strong>Status:</strong> <span className={styles.status}>{content?.works?.status}</span></p>
                        <p><strong>Items:</strong> {content?.works?.items?.length || 0} projects</p>
                    </div>
                    <div className={styles.comingSoon}>
                        🚧 Edit feature coming soon
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Gear size={40} duration={9} color="var(--c-gear-gold)" />
                        <h2 className={styles.cardTitle}>Contact</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <p><strong>Title:</strong> {content?.contact?.title}</p>
                        <p><strong>Email:</strong> {content?.contact?.email}</p>
                        <p><strong>GitHub:</strong> {content?.contact?.github}</p>
                        <p><strong>Twitter:</strong> {content?.contact?.twitter}</p>
                    </div>
                    <Link href="/admin/edit/contact" className={styles.editButton}>
                        Edit Contact
                    </Link>
                </div>
            </div>
        </div>
    );
}
