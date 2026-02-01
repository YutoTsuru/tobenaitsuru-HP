import Link from 'next/link';
import { getContent } from '../lib/utils';
import Gear from '../components/Gear';
import MakesCarousel from '../components/MakesCarousel';
import styles from './page.module.css';

// ページキャッシュを無効化（常に最新データを取得）
export const revalidate = 0;

export default async function Home() {
    const content = await getContent();
    const { title, subtitle } = content?.home || { title: 'Tobenaitsuru', subtitle: 'Portfolio' };
    const makesItems = content?.makes?.items || [];

    return (
        <div className={styles.hero}>
            {/* Background Gears */}
            <div className={styles.bgGear1}>
                <Gear size={600} duration={60} />
            </div>
            <div className={styles.bgGear2}>
                <Gear size={400} duration={40} reverse />
            </div>
            <div className={styles.bgGear3}>
                <Gear size={200} duration={30} />
            </div>

            <div className={styles.container}>
                <div className={styles.headerSection}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div className={styles.carouselSection}>
                    <MakesCarousel items={makesItems} />
                </div>
            </div>
        </div>
    );
}
