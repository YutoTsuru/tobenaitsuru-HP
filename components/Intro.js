'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Intro.module.css';

/*
 * 撤去は CSS の animationend で行う。演出の長さは CSS だけが持っていて、
 * ここの定数は「イベントを取りこぼしたとき」の保険にしか使わない。
 * そのため多少ずれても見た目には出ない。
 */
const FALLBACK_MS = 2400;
const SKIP_FALLBACK_MS = 600;

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
    // 溶暗が始まったか。始まった後のスキップは画面を巻き戻すので受け付けない
    const leaving = useRef(false);

    // 演出中はスクロールを止める
    useEffect(() => {
        if (!open || disabled) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [open, disabled]);

    /*
     * 保険のタイマー。animationend が来ない環境（アニメーションを切っている等）でも
     * 必ず撤去されるようにする。ハイドレーションが遅れても演出の終わりから離れないよう、
     * マウント時刻ではなくページ読み込みからの経過で残り時間を測る。
     */
    useEffect(() => {
        if (!open || disabled) return undefined;
        const remaining = skipping
            ? SKIP_FALLBACK_MS
            : Math.max(0, FALLBACK_MS - performance.now());
        const id = setTimeout(() => setOpen(false), remaining);
        return () => clearTimeout(id);
    }, [open, skipping, disabled]);

    // クリック・キー操作でスキップ
    useEffect(() => {
        if (!open || skipping || disabled) return undefined;
        const skip = () => {
            if (leaving.current) return;
            setSkipping(true);
        };
        window.addEventListener('pointerdown', skip);
        window.addEventListener('keydown', skip);
        return () => {
            window.removeEventListener('pointerdown', skip);
            window.removeEventListener('keydown', skip);
        };
    }, [open, skipping, disabled]);

    // 名乗りと線のアニメーションも上がってくるので、覆い自身の分だけを見る
    const handleAnimationStart = useCallback((event) => {
        if (event.target !== event.currentTarget) return;
        leaving.current = true;
    }, []);

    const handleAnimationEnd = useCallback((event) => {
        if (event.target !== event.currentTarget) return;
        setOpen(false);
    }, []);

    if (!open || disabled) return null;

    return (
        <div
            className={`${styles.overlay}${skipping ? ` ${styles.skipping}` : ''}`}
            role="presentation"
            aria-hidden="true"
            onAnimationStart={handleAnimationStart}
            onAnimationEnd={handleAnimationEnd}
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
