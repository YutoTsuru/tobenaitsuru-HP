'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GEAR_PATH } from './Gear';
import styles from './GateIntro.module.css';

// CSS 側の演出（扉が開ききる 4.8s ＋ 溶暗 0.45s）に合わせた撤去タイミング
const TOTAL_MS = 5250;
const SKIP_MS = 320;

/** 金属の陰影。歯車の塗りに使うグラデーションを一度だけ定義する */
function MetalDefs() {
    return (
        <svg className={styles.defs} aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id="gate-metal-steel" x1="0" y1="0" x2="0.85" y2="1">
                    <stop offset="0%" stopColor="#e7edf1" />
                    <stop offset="34%" stopColor="#aab4bc" />
                    <stop offset="62%" stopColor="#69737b" />
                    <stop offset="100%" stopColor="#39424a" />
                </linearGradient>
                <linearGradient id="gate-metal-brass" x1="0" y1="0" x2="0.85" y2="1">
                    <stop offset="0%" stopColor="#f2dcae" />
                    <stop offset="34%" stopColor="#cfa863" />
                    <stop offset="62%" stopColor="#96702f" />
                    <stop offset="100%" stopColor="#5a441d" />
                </linearGradient>
                <linearGradient id="gate-metal-copper" x1="0" y1="0" x2="0.85" y2="1">
                    <stop offset="0%" stopColor="#f0c3a2" />
                    <stop offset="34%" stopColor="#c07f52" />
                    <stop offset="62%" stopColor="#8a5230" />
                    <stop offset="100%" stopColor="#4d2c19" />
                </linearGradient>
                <linearGradient id="gate-metal-dark" x1="0" y1="0" x2="0.85" y2="1">
                    <stop offset="0%" stopColor="#8e979e" />
                    <stop offset="40%" stopColor="#5a636a" />
                    <stop offset="100%" stopColor="#272e34" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/**
 * 扉に彫り込まれた歯車。
 * span = 静止（影を落とす担当）／ svg = 始動の加速 ／ g = 定速回転
 * 影を回さないために、回転する要素と影を落とす要素を分けている。
 */
function DoorGear({ size, spin, tone = 'steel', reverse = false, extra = false, style }) {
    const cls = [styles.gear, styles[tone], extra ? styles.gearExtra : ''].filter(Boolean).join(' ');
    return (
        <span className={cls} style={{ width: size, height: size, ...style }}>
            <svg viewBox="0 0 100 100" className={styles.gearSvg} aria-hidden="true">
                <g
                    className={styles.gearSpin}
                    style={{
                        animationDuration: `${spin}s`,
                        animationDirection: reverse ? 'reverse' : 'normal',
                    }}
                >
                    {/* 彫りの深さ：本体の下に暗い面をずらして敷く */}
                    <path d={GEAR_PATH} fill="rgba(12, 16, 20, 0.55)" transform="translate(2.4 3)" />
                    <path d={GEAR_PATH} fill={`url(#gate-metal-${tone})`} />
                    {/* 上端の光。面取りに当たった反射 */}
                    <path
                        d={GEAR_PATH}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.42)"
                        strokeWidth="0.9"
                        transform="translate(-0.7 -0.9)"
                    />
                    <circle cx="51.7" cy="50" r="9" fill={`url(#gate-metal-dark)`} />
                    <circle cx="51.7" cy="50" r="9" fill="none" stroke="rgba(0, 0, 0, 0.5)" strokeWidth="1.2" />
                </g>
            </svg>
        </span>
    );
}

/** 打ち込まれたマイナスネジ */
function Screw({ style, angle = 0, size = 15 }) {
    return (
        <span
            className={styles.screw}
            style={{ width: size, height: size, '--screw-angle': `${angle}deg`, ...style }}
            aria-hidden="true"
        />
    );
}

// 左扉の歯車。噛み合って見えるよう、大小を寄せて重ねる
const LEFT_GEARS = [
    { size: 620, spin: 30, tone: 'steel', style: { top: '50%', right: '-310px', marginTop: '-310px' } },
    { size: 300, spin: 20, tone: 'steel', reverse: true, style: { bottom: '1%', left: '3%' } },
    { size: 214, spin: 12, tone: 'brass', style: { top: '19%', right: '13%' } },
    { size: 152, spin: 8, tone: 'steel', reverse: true, style: { top: '33%', right: '1%' } },
    { size: 124, spin: 6, tone: 'copper', style: { top: '7%', left: '25%' } },
    { size: 186, spin: 14, tone: 'steel', style: { top: '1%', left: '1%' } },
    { size: 96, spin: 5, tone: 'brass', reverse: true, style: { bottom: '25%', left: '29%' } },
    { size: 134, spin: 9, tone: 'brass', style: { bottom: '11%', left: '33%' } },
    { size: 78, spin: 4, tone: 'steel', style: { top: '25%', left: '13%' } },
    { size: 164, spin: 11, tone: 'steel', reverse: true, style: { bottom: '29%', right: '23%' } },
    { size: 110, spin: 7, tone: 'copper', style: { bottom: '4%', right: '6%' } },
    { size: 66, spin: 3.5, tone: 'brass', reverse: true, style: { top: '45%', left: '1%' }, extra: true },
    { size: 90, spin: 5, tone: 'steel', style: { top: '59%', left: '19%' }, extra: true },
    { size: 206, spin: 16, tone: 'steel', style: { top: '51%', right: '5%' }, extra: true },
    { size: 74, spin: 4, tone: 'copper', reverse: true, style: { bottom: '43%', left: '5%' }, extra: true },
    { size: 58, spin: 3, tone: 'brass', style: { top: '15%', left: '39%' }, extra: true },
];

// 右扉。左とは配置も回転方向も変えて、対称に見えないようにする
const RIGHT_GEARS = [
    { size: 620, spin: 30, tone: 'steel', reverse: true, style: { top: '50%', left: '-310px', marginTop: '-310px' } },
    { size: 286, spin: 19, tone: 'steel', style: { top: '2%', right: '4%' } },
    { size: 228, spin: 13, tone: 'brass', reverse: true, style: { bottom: '14%', right: '11%' } },
    { size: 146, spin: 8, tone: 'steel', style: { top: '41%', left: '2%' } },
    { size: 118, spin: 6, tone: 'copper', reverse: true, style: { bottom: '4%', left: '22%' } },
    { size: 178, spin: 14, tone: 'steel', reverse: true, style: { bottom: '1%', right: '34%' } },
    { size: 98, spin: 5, tone: 'brass', style: { top: '27%', right: '30%' } },
    { size: 138, spin: 9, tone: 'brass', reverse: true, style: { top: '12%', left: '14%' } },
    { size: 80, spin: 4, tone: 'steel', reverse: true, style: { bottom: '31%', left: '9%' } },
    { size: 158, spin: 11, tone: 'steel', style: { top: '58%', right: '18%' } },
    { size: 106, spin: 7, tone: 'copper', reverse: true, style: { top: '3%', right: '38%' } },
    { size: 70, spin: 3.5, tone: 'brass', style: { bottom: '46%', right: '2%' }, extra: true },
    { size: 88, spin: 5, tone: 'steel', reverse: true, style: { bottom: '19%', left: '30%' }, extra: true },
    { size: 198, spin: 16, tone: 'steel', reverse: true, style: { top: '33%', left: '18%' }, extra: true },
    { size: 76, spin: 4, tone: 'copper', style: { top: '48%', right: '36%' }, extra: true },
    { size: 60, spin: 3, tone: 'brass', reverse: true, style: { bottom: '38%', right: '26%' }, extra: true },
];

// ネジの位置（％）と首の向き
const SCREWS = [
    { top: '3%', left: '4%', angle: 24 },
    { top: '3%', right: '5%', angle: -38 },
    { bottom: '3%', left: '6%', angle: 62 },
    { bottom: '3%', right: '4%', angle: 12 },
    { top: '27%', left: '2%', angle: -14 },
    { bottom: '27%', right: '2%', angle: 47 },
    { top: '50%', left: '46%', angle: 33 },
    { top: '13%', right: '30%', angle: -52 },
    { bottom: '13%', left: '28%', angle: 8 },
    { top: '68%', right: '44%', angle: -21 },
];

/** 鋼板・パイプ・補強梁・油圧ピストンといった扉の構造物 */
function DoorFrame() {
    return (
        <>
            <span className={styles.grain} />
            <span className={styles.bolts} />
            <span className={`${styles.pipe} ${styles.pipeOuter}`} />
            <span className={`${styles.pipe} ${styles.pipeSlim} ${styles.pipeInner}`} />
            <span className={`${styles.rib} ${styles.ribTop}`} />
            <span className={`${styles.rib} ${styles.ribBottom}`} />
            <span className={`${styles.stripe} ${styles.stripeTop}`} />
            <span className={`${styles.stripe} ${styles.stripeBottom}`} />
            <span className={`${styles.piston} ${styles.pistonTop}`}>
                <span className={styles.pistonRod} />
                <span className={styles.pistonBody} />
            </span>
            <span className={`${styles.piston} ${styles.pistonBottom}`}>
                <span className={styles.pistonRod} />
                <span className={styles.pistonBody} />
            </span>
        </>
    );
}

/** 歯車を敷き詰めた面。ネジは歯車より手前に打つ */
function GearPlate({ gears }) {
    return (
        <>
            {gears.map((gear, i) => (
                <DoorGear key={`g${i}`} {...gear} />
            ))}
            {SCREWS.map((screw, i) => {
                const { angle, ...position } = screw;
                return <Screw key={`s${i}`} angle={angle} style={position} />;
            })}
        </>
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
            <MetalDefs />

            <div className={`${styles.panel} ${styles.panelLeft}`}>
                <DoorFrame />
                <GearPlate gears={LEFT_GEARS} />
                <span className={styles.edge} />
            </div>

            <div className={`${styles.panel} ${styles.panelRight}`}>
                <DoorFrame />
                <GearPlate gears={RIGHT_GEARS} />
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
