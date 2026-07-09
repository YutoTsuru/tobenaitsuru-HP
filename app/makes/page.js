import { getContent } from '../../lib/utils';
import Gear from '../../components/Gear';
import Link from 'next/link';
import TechBadgeList from '../../components/TechBadgeList';
import styles from './page.module.css';

// ページキャッシュを無効化（常に最新データを取得）
export const revalidate = 0;

export const metadata = {
    title: 'Makes | Tobenaitsuru',
    description: 'My creations, products, and experiments.',
};

// 不正なURLでも throw させずホスト名を取り出す
function getHostname(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

export default async function MakesPage() {
    const content = await getContent();
    const makes = content.makes || { title: 'Makes', items: [] };
    // 下書き(isPublished: false)は公開ページに表示しない
    const publishedItems = (makes.items || []).filter((item) => item.isPublished !== false);

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <div className={styles.gearWrapper}>
                    <Gear size={300} duration={40} color="var(--c-gear-dark)" />
                </div>
                <h1 className={styles.title}>{makes.title}</h1>
                <p className={styles.subtitle}>My creations & experiments</p>
            </div>

            <div className={styles.grid}>
                {publishedItems.length > 0 ? (
                    publishedItems.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.thumbnailWrapper}>
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.title} className={styles.thumbnail} />
                                ) : (
                                    <div className={styles.noImage}>No Image</div>
                                )}
                                {item.externalUrl && (
                                    <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className={styles.visitButton}>
                                        Visit ↗
                                    </a>
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <h2 className={styles.cardTitle}>{item.title}</h2>
                                <p className={styles.cardDescription}>{item.description}</p>

                                <TechBadgeList techStack={item.techStack} />

                                {item.externalUrl && (
                                    <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                        {getHostname(item.externalUrl)}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.empty}>
                        <p>No makes yet. Coming soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
