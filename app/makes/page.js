import { getContent } from '../../lib/utils';
import Gear from '../../components/Gear';
import Link from 'next/link';
import TechBadgeList from '../../components/TechBadgeList';
import styles from './page.module.css';

export const metadata = {
    title: 'Makes | Tobenaitsuru',
    description: 'My creations, products, and experiments.',
};

export default async function MakesPage() {
    const content = await getContent();
    const makes = content.makes || { title: 'Makes', items: [] };

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
                {makes.items && makes.items.length > 0 ? (
                    makes.items.map((item) => (
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
                                        {new URL(item.externalUrl).hostname}
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
