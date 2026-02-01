'use client';

import styles from './TechBadgeList.module.css';

export default function TechBadgeList({ techStack = [], limit = null }) {
    if (!techStack || techStack.length === 0) return null;

    const displayStack = limit ? techStack.slice(0, limit) : techStack;
    const remaining = limit && techStack.length > limit ? techStack.length - limit : 0;

    return (
        <div className={styles.techList}>
            {displayStack.map(tech => (
                <span key={tech} className={styles.techBadge}>{tech}</span>
            ))}
            {remaining > 0 && (
                <span className={styles.moreTech}>+{remaining}</span>
            )}
        </div>
    );
}
