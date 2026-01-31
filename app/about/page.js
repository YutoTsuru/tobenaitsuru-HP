import { getContent } from '../../lib/utils';
import styles from './page.module.css';

export default async function About() {
    const content = await getContent();
    const { title, content: aboutContent, profile } = content?.about || {};

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.section}>
                <div className={styles.profileBox}>
                    <h2 className={styles.heading}>Profile</h2>
                    <p className={styles.text}>{profile}</p>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.heading}>Background</h2>
                    <p className={styles.text}>{aboutContent}</p>
                </div>
            </div>
        </div>
    );
}
