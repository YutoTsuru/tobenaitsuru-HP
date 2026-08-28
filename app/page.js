import Link from 'next/link';
import { getContent } from '../lib/utils';
import Gear from '../components/Gear';
import MakesBook from '../components/MakesBook';
import styles from './page.module.css';

// ページキャッシュを無効化（常に最新データを取得）
export const revalidate = 0;

// 本の目次として並べる行き先
const CONTENTS = [
    { num: 'I', href: '/about', label: 'About', desc: 'Who I am' },
    { num: 'II', href: '/skills', label: 'Skills', desc: 'What I can do' },
    { num: 'III', href: '/makes', label: 'Makes', desc: 'My Creations' },
    { num: 'IV', href: '/contact', label: 'Contact', desc: 'Get in touch' },
];

export default async function Home() {
    const content = await getContent();
    const { subtitle } = content?.home || { subtitle: 'Thinking, Designing, Making' };
    // 下書き(isPublished: false)は公開ページに表示しない
    const makesItems = (content?.makes?.items || []).filter((item) => item.isPublished !== false);

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
                {/* 主役は本。名乗りは読み上げと検索エンジンのためだけに置く */}
                <h1 className={styles.pageName}>Tobenaitsuru — {subtitle}</h1>

                <div className={styles.carouselSection}>
                    <h2 className={styles.carouselTitle}>Latest Makes</h2>
                    <MakesBook items={makesItems} />
                </div>

                <nav className={styles.contents} aria-label="サイトの目次">
                    <p className={styles.contentsLabel}>Contents</p>
                    <ul className={styles.contentsList}>
                        {CONTENTS.map((entry) => (
                            <li key={entry.href} className={styles.contentsItem}>
                                <Link href={entry.href} className={styles.contentsLink}>
                                    <span className={styles.contentsNum}>{entry.num}</span>
                                    <span className={styles.contentsName}>{entry.label}</span>
                                    <span className={styles.contentsLeader} aria-hidden="true" />
                                    <span className={styles.contentsDesc}>{entry.desc}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
