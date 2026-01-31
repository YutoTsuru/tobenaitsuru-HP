import Link from 'next/link';
import { getContent } from '../lib/utils';
import Gear from '../components/Gear';
import styles from './page.module.css';

export default async function Home() {
    const content = await getContent();
    const { title, subtitle } = content?.home || { title: 'Tobenaitsuru', subtitle: 'Portfolio' };

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

            <div className={styles.heroContent}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.subtitle}>{subtitle}</p>

                <div className={styles.links}>
                    <Link href="/about" className={styles.linkCard}>
                        <div className={styles.linkTitle}>About</div>
                        <div className={styles.linkDesc}>Who I am</div>
                    </Link>
                    <Link href="/skills" className={styles.linkCard}>
                        <div className={styles.linkTitle}>Skills</div>
                        <div className={styles.linkDesc}>What I can do</div>
                    </Link>
                    <Link href="/works" className={styles.linkCard}>
                        <div className={styles.linkTitle}>Works</div>
                        <div className={styles.linkDesc}>What I built</div>
                    </Link>
                    <Link href="/contact" className={styles.linkCard}>
                        <div className={styles.linkTitle}>Contact</div>
                        <div className={styles.linkDesc}>Get in touch</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
