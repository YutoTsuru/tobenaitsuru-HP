'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GEAR_PATH } from './Gear';
import styles from './GateIntro.module.css';

// CSS 側の演出（扉が開ききる 3.4s ＋ 溶暗 0.45s）に合わせた撤去タイミング
const TOTAL_MS = 3850;
const SKIP_MS = 320;

/** 扉に埋め込まれた歯車。外側の span が始動の加速、内側の svg が定速回転を受け持つ */
function DoorGear({ size, spin, delay = 0, reverse = false, tone = 'brass', style }) {
    return (
        <span className={`${styles.gear} ${styles[tone]}`} style={{ width: size, height: size, ...style }}>
            <svg
                viewBox="0 0 100 100"
                className={styles.gearSvg}
                style={{
                    animationDuration: `${spin}s`,
                    animationDirection: reverse ? 'reverse' : 'normal',
                    animationDelay: `${delay}s`,
                }}
            >
                <path d={GEAR_PATH} fill="currentColor" />
            </svg>
        </span>
    );
}

export default function GateIntro() {
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

    // 開ききったら DOM から取り除く
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
            <div className={`${styles.panel} ${styles.panelLeft}`}>
                <span className={styles.rivets} />
                <span className={`${styles.stripe} ${styles.stripeTop}`} />
                <span className={`${styles.stripe} ${styles.stripeBottom}`} />
                <DoorGear size={620} spin={26} tone="brass" style={{ top: '50%', right: '-310px', marginTop: '-310px' }} />
                <DoorGear size={200} spin={9} reverse tone="copper" style={{ top: '14%', right: '16%' }} />
                <DoorGear size={130} spin={6} tone="steel" style={{ top: '30%', right: '4%' }} />
                <DoorGear size={280} spin={18} reverse tone="steel" style={{ bottom: '6%', left: '8%' }} />
                <DoorGear size={110} spin={5} tone="neon" style={{ bottom: '26%', left: '30%' }} />
                <DoorGear size={170} spin={11} reverse tone="brass" style={{ top: '6%', left: '18%' }} />
                <span className={styles.edge} />
            </div>

            <div className={`${styles.panel} ${styles.panelRight}`}>
                <span className={styles.rivets} />
                <span className={`${styles.stripe} ${styles.stripeTop}`} />
                <span className={`${styles.stripe} ${styles.stripeBottom}`} />
                <DoorGear size={620} spin={26} reverse tone="brass" style={{ top: '50%', left: '-310px', marginTop: '-310px' }} />
                <DoorGear size={200} spin={9} tone="copper" style={{ top: '18%', left: '14%' }} />
                <DoorGear size={130} spin={6} reverse tone="steel" style={{ top: '36%', left: '3%' }} />
                <DoorGear size={280} spin={18} tone="steel" style={{ bottom: '10%', right: '6%' }} />
                <DoorGear size={110} spin={5} reverse tone="neon" style={{ bottom: '30%', right: '28%' }} />
                <DoorGear size={170} spin={11} tone="brass" style={{ top: '4%', right: '20%' }} />
                <span className={styles.edge} />
            </div>

            <span className={styles.seam} />
            <span className={styles.scan} />

            <div className={styles.status}>
                <span className={styles.statusInit}>UNLOCKING</span>
                <span className={styles.statusOpen}>ACCESS GRANTED</span>
            </div>
        </div>
    );
}
