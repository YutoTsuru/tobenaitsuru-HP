'use client';

import { useState } from 'react';
import styles from './TechStackInput.module.css';

const TECH_PRESETS = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js',
    'Python', 'Django', 'Flask', 'FastAPI',
    'Node.js', 'HTML', 'CSS', 'TailwindCSS',
    'Vercel', 'AWS', 'GCP', 'Firebase', 'Supabase'
];

export default function TechStackInput({ techStack = [], onChange, isMini = false }) {

    // タグ追加・削除
    const toggleTech = (tech) => {
        const currentStack = techStack || [];
        const newStack = currentStack.includes(tech)
            ? currentStack.filter(t => t !== tech)
            : [...currentStack, tech];
        onChange(newStack);
    };

    // 手動入力
    const addCustomTech = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.target.value.trim();
            if (!val) return;

            const currentStack = techStack || [];
            if (!currentStack.includes(val)) {
                onChange([...currentStack, val]);
            }
            e.target.value = '';
        }
    };

    return (
        <div className={styles.techWrapper}>
            <div className={styles.selectedTech}>
                {(techStack || []).map(tech => (
                    <span key={tech} className={styles.techTag}>
                        {tech}
                        <button onClick={() => toggleTech(tech)} className={styles.removeTagBtn}>×</button>
                    </span>
                ))}
            </div>

            <input
                type="text"
                className={isMini ? styles.miniInput : styles.input}
                onKeyDown={addCustomTech}
                placeholder={isMini ? "Add tech..." : "Type custom tech and press Enter..."}
            />

            <div className={styles.presetList}>
                {TECH_PRESETS.map(tech => (
                    <button
                        key={tech}
                        onClick={() => toggleTech(tech)}
                        className={`${styles.presetTag} ${(techStack || []).includes(tech) ? styles.active : ''}`}
                    >
                        {tech}
                    </button>
                ))}
            </div>
        </div>
    );
}
