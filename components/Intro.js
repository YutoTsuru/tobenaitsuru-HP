'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Intro.module.css';

// CSS 側の演出（名乗り 1.2s ＋ 溶暗 0.4s）に合わせた撤去タイミング
const TOTAL_MS = 1650;
const SKIP_MS = 260;

/**
 * 起動時の名乗り。
 * 地の色はサイト本体と同じにして、幕を引くというより紙が現れる感じにする。
 */
export default function Intro() {
    const pathname = usePathname();
    // 管理画面では演出を挟まない
    const disabled = Boolean(pathname && pathname.startsWith('/admin'));
    const [open, setOpen] = useState(true);
    const [skipping, setSkipping] = useState(false);

    // 演出中はスクロールを止める
    useEffect(() => {
        if (!open || disabled) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, disabled]);

    // 溶暗しきったら DOM から取り除く
    useEffect(() => {
        if (!open || disabled) return undefined;
        const id = setTimeout(() => setOpen(false), skipping ? SKIP_MS : TOTAL_MS);
        return () => clearTimeout(id);
    }, [open, skipping, disabled]);

    // クリック・キー操作でスキップ
    useEffect(() => {
        if (!open || skipping || disabled) return undefined;
        const skip = () => setSkipping(true);
        window.addEventListener('pointerdown', skip);
        window.addEventListener('keydown', skip);
        return () => {
            window.removeEventListener('pointerdown', skip);
            window.removeEventListener('keydown', skip);
        };
    }, [open, skipping, disabled]);

    if (!open || disabled) return null;

    return (
        <div
            className={`${styles.overlay}${skipping ? ` ${styles.skipping}` : ''}`}
            role="presentation"
            aria-hidden="true"
        >
            <div className={styles.mark}>
                <span className={styles.name}>Tobenaitsuru</span>
                <span className={styles.rule}>
                    <span className={styles.ruleFill} />
                </span>
            </div>
        </div>
    );
}
