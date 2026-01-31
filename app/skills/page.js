import { getContent } from '../../lib/utils';
import Gear from '../../components/Gear';
import styles from './page.module.css';

// ページキャッシュを無効化（常に最新データを取得）
export const revalidate = 0;

export default async function Skills() {
    const content = await getContent();
    const { title, items } = content?.skills || { items: [] };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.grid}>
                {items.map((item, index) => (
                    <div key={index} className={styles.card} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className={styles.gearIcon}>
                            <Gear size={80} color="var(--c-accent-1)" />
                        </div>
                        <h3 className={styles.cardName}>{item.name}</h3>
                        <p className={styles.cardLevel}>{item.level}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
