import { getContent } from '../../lib/utils';
import Gear from '../../components/Gear';
import styles from './page.module.css';

export default async function Works() {
    const content = await getContent();
    const { title, status, items } = content?.works || { items: [] };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>

            {items.length === 0 ? (
                <div className={styles.statusBox}>
                    <div className={styles.gearWrapper}>
                        <Gear size={120} duration={10} color="var(--c-accent-3)" />
                    </div>
                    <p className={styles.statusText}>{status || "Coming Soon"}</p>
                </div>
            ) : (
                <div>
                    {/* Future implementation for items */}
                </div>
            )}
        </div>
    );
}
