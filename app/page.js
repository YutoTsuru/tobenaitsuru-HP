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

                    <div className={styles.navLinks}>
                        <Link href="/about" className={styles.navItem}>
                            <span className={styles.navLabel}>About</span>
                            <span className={styles.navDesc}>Who I am</span>
                        </Link>
                        <Link href="/skills" className={styles.navItem}>
                            <span className={styles.navLabel}>Skills</span>
                            <span className={styles.navDesc}>What I can do</span>
                        </Link>
                        <Link href="/makes" className={styles.navItem}>
                            <span className={styles.navLabel}>Makes</span>
                            <span className={styles.navDesc}>My Creations</span>
                        </Link>
                        <Link href="/contact" className={styles.navItem}>
                            <span className={styles.navLabel}>Contact</span>
                            <span className={styles.navDesc}>Get in touch</span>
                        </Link>
                    </div>
                </div>

                <div className={styles.carouselSection}>
                    <h2 className={styles.carouselTitle}>Latest Makes</h2>
                    <MakesCarousel items={makesItems} />
                </div>
            </div>
        </div>
    );
}
