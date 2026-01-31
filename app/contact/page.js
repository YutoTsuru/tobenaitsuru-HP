import { getContent } from '../../lib/utils';
import styles from './page.module.css';

// ページキャッシュを無効化（常に最新データを取得）
export const revalidate = 0;

export default async function Contact() {
    const content = await getContent();
    const { title, email, github, twitter } = content?.contact || {};

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.list}>
                {email && (
                    <div className={styles.item}>
                        <span className={styles.label}>Email</span>
                        <a href={`mailto:${email}`} className={styles.link}>{email}</a>
                    </div>
                )}
                {github && (
                    <div className={styles.item}>
                        <span className={styles.label}>GitHub</span>
                        <a href={github} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            {github.replace('https://', '')}
                        </a>
                    </div>
                )}
                {twitter && (
                    <div className={styles.item}>
                        <span className={styles.label}>Twitter / X</span>
                        <a href={twitter} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            {twitter.replace('https://', '')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
