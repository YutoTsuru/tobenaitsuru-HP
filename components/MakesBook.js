'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TechBadgeList from './TechBadgeList';
import styles from './MakesBook.module.css';

const FLIP_MS = 950;
// 開いた本のページの起き上がり角度（左右対称に手前へ開く）
const TILT = 6;
const AUTOPLAY_MS = 6000;
const STACK_LEAVES = 12; // 本全体の紙の厚み（枚数の見え方）
const MIN_LEAVES = 2;

/**
 * ページの外側に重なる紙束（厚み）を box-shadow の層で作る。
 * dir: -1 = 左ページ（左下へ重なる） / 1 = 右ページ（右下へ重なる）
 */
function leafStack(count, dir) {
    const layers = [];
    for (let k = 1; k <= count; k += 1) {
        const paper = k % 2 === 0 ? '#efe3cd' : '#fbf4e6';
        layers.push(`${dir * k}px ${k}px 0 ${paper}`);
    }
    layers.push(`${dir * (count + 1)}px ${count + 1}px 0 #d9c9ac`);
    layers.push(`${dir * (count + 3)}px ${count + 6}px 12px rgba(74, 59, 50, 0.3)`);
    return layers.join(', ');
}

// SSR では useLayoutEffect が警告を出すので切り替える
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** 左ページ（写真を貼った台紙） */
function LeftPage({ item, index, total }) {
    if (!item) return <div className={styles.pageInner} />;
    return (
        <div className={styles.pageInner}>
            <div className={styles.photoFrame}>
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className={styles.photo} />
                ) : (
                    <div className={styles.noPhoto}>No Image</div>
                )}
                <span className={styles.tape} aria-hidden="true" />
                <span className={`${styles.tape} ${styles.tapeRight}`} aria-hidden="true" />
            </div>
            <p className={styles.caption}>
                No. {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <span className={styles.folio}>{index * 2 + 1}</span>
        </div>
    );
}

/** 右ページ（作品の記述） */
function RightPage({ item, index }) {
    if (!item) return <div className={styles.pageInner} />;
    return (
        <div className={styles.pageInner}>
            <p className={styles.chapter}>Makes</p>
            <h3 className={styles.title}>{item.title}</h3>
            <span className={styles.rule} aria-hidden="true" />

            {item.thumbnail && (
                <div className={styles.mobilePhoto}>
                    <img src={item.thumbnail} alt="" className={styles.photo} />
                </div>
            )}

            {item.description && <p className={styles.description}>{item.description}</p>}

            <div className={styles.techArea}>
                <TechBadgeList techStack={item.techStack} limit={4} />
            </div>

            <div className={styles.pageFooter}>
                {item.externalUrl ? (
                    <Link href={item.externalUrl} target="_blank" className={styles.link}>
                        View Project →
                    </Link>
                ) : (
                    <span className={styles.noLink}>View Details</span>
                )}
            </div>
            <span className={styles.folio}>{index * 2 + 2}</span>
        </div>
    );
}

export default function MakesBook({ items }) {
    const list = items || [];
    const total = list.length;

    const [index, setIndex] = useState(0);
    // flip: { dir: 'next' | 'prev', from, to }
    const [flip, setFlip] = useState(null);
    const [paused, setPaused] = useState(false);
    const sheetRef = useRef(null);
    const animRef = useRef(null);

    const turn = useCallback(
        (dir) => {
            if (total < 2) return;
            setFlip((current) => {
                if (current) return current; // めくり中は無視
                const to = dir === 'next' ? (index + 1) % total : (index - 1 + total) % total;
                return { dir, from: index, to };
            });
        },
        [index, total]
    );

    // めくりアニメーション（進む／戻るのどちらも同じ経路を逆再生する）
    useIsoLayoutEffect(() => {
        if (!flip) {
            if (animRef.current) {
                animRef.current.cancel();
                animRef.current = null;
            }
            return undefined;
        }

        const el = sheetRef.current;
        const commit = () => {
            setIndex(flip.to);
            setFlip(null);
        };

        if (!el || typeof el.animate !== 'function') {
            const id = setTimeout(commit, FLIP_MS);
            return () => clearTimeout(id);
        }

        const reduced =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 開いた本の傾きに合わせて、右ページ位置から左ページ位置へ半回転させる
        const sequence = [
            `rotateY(${-TILT}deg)`, // 右ページの位置
            'rotateY(-90deg) translateZ(30px)', // 立ち上がった瞬間
            `rotateY(${-180 + TILT}deg)`, // 左ページの位置
        ];
        const order = flip.dir === 'next' ? sequence : [...sequence].reverse();
        const frames = order.map((transform, i) => ({ transform, offset: [0, 0.5, 1][i] }));

        const anim = el.animate(frames, {
            duration: reduced ? 1 : FLIP_MS,
            easing: 'cubic-bezier(0.45, 0.05, 0.4, 1)',
            fill: 'forwards',
        });

        animRef.current = anim;
        anim.onfinish = commit;

        return () => {
            anim.onfinish = null;
        };
    }, [flip]);

    // 自動でページをめくる
    useEffect(() => {
        if (paused || total < 2 || flip) return;
        const id = setTimeout(() => turn('next'), AUTOPLAY_MS);
        return () => clearTimeout(id);
    }, [paused, total, flip, turn]);

    if (total === 0) {
        return (
            <div className={styles.empty}>
                <p>Coming Soon...</p>
            </div>
        );
    }

    // めくり中に静止レイヤーへ表示する内容
    const staticLeft = flip && flip.dir === 'prev' ? flip.to : index;
    const staticRight = flip && flip.dir === 'next' ? flip.to : index;
    // めくれる紙：表＝右ページ / 裏＝めくった先の左ページ
    const sheetFront = flip ? (flip.dir === 'next' ? flip.from : flip.to) : index;
    const sheetBack = flip ? (flip.dir === 'next' ? flip.to : flip.from) : index;

    // 読み進めるほど左が厚く、右が薄くなる（束の総量は一定）
    const progress = flip ? flip.to : index;
    const ratio = total > 1 ? progress / (total - 1) : 0;
    const leftLeaves = MIN_LEAVES + Math.round(ratio * (STACK_LEAVES - MIN_LEAVES * 2));
    const rightLeaves = STACK_LEAVES - leftLeaves;

    const sheetClass = `${styles.sheet}${flip ? ` ${styles.sheetVisible}` : ''}`;

    return (
        <div className={styles.bookWrapper}>
            <div
                className={styles.book}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={() => setPaused(false)}
            >
                <div className={styles.spread}>
                    <div
                        className={`${styles.page} ${styles.pageLeft}`}
                        style={{ boxShadow: leafStack(leftLeaves, -1) }}
                    >
                        <LeftPage item={list[staticLeft]} index={staticLeft} total={total} />
                    </div>
                    <div
                        className={`${styles.page} ${styles.pageRight}`}
                        style={{ boxShadow: leafStack(rightLeaves, 1) }}
                    >
                        <RightPage item={list[staticRight]} index={staticRight} />
                    </div>

                    <span className={styles.ribbon} aria-hidden="true" />

                    {/* めくれる紙 */}
                    <div className={sheetClass} ref={sheetRef} aria-hidden="true">
                        <div className={`${styles.sheetFace} ${styles.sheetFront}`}>
                            <RightPage item={list[sheetFront]} index={sheetFront} />
                        </div>
                        <div className={`${styles.sheetFace} ${styles.sheetBack}`}>
                            <LeftPage item={list[sheetBack]} index={sheetBack} total={total} />
                        </div>
                    </div>

                    <span className={styles.gutter} aria-hidden="true" />
                </div>

                {total > 1 && (
                    <>
                        <button
                            type="button"
                            className={`${styles.corner} ${styles.cornerPrev}`}
                            onClick={() => turn('prev')}
                            aria-label="前のページ"
                        />
                        <button
                            type="button"
                            className={`${styles.corner} ${styles.cornerNext}`}
                            onClick={() => turn('next')}
                            aria-label="次のページ"
                        />
                    </>
                )}
            </div>

            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={() => turn('prev')}
                    disabled={total < 2}
                    aria-label="前のページ"
                >
                    ‹
                </button>
                <span className={styles.counter}>
                    {String(index + 1).padStart(2, '0')} <em>/</em> {String(total).padStart(2, '0')}
                </span>
                <button
                    type="button"
                    className={styles.navButton}
                    onClick={() => turn('next')}
                    disabled={total < 2}
                    aria-label="次のページ"
                >
                    ›
                </button>
            </div>

            <div className={styles.moreButtonWrapper}>
                <Link href="/makes" className={styles.moreButton}>
                    All Makes
                </Link>
            </div>
        </div>
    );
}
