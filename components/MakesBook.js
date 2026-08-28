'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TechBadgeList from './TechBadgeList';
import { isMuted, playRustle, setMuted } from './paperSound';
import styles from './MakesBook.module.css';

const FLIP_MS = 950;
// 開いた本のページの起き上がり角度（左右対称に手前へ開く）
const TILT = 6;
// めくる紙が本から浮き上がる高さ
const LIFT = 30;
const AUTOPLAY_MS = 6000;
const STACK_LEAVES = 12; // 本全体の紙の厚み（枚数の見え方）
const MIN_LEAVES = 2;
const DRAG_START_PX = 6; // これ以上動かしたらめくり始める
const FLICK_VELOCITY = 0.5; // px/ms：勢いよく払ったら最後までめくる
const SINGLE_PAGE_MQ = '(max-width: 760px)';
// 紙束モード（スマホ）：横へ抜く割合と、抜けきるまでの進捗
const SLIDE_PHASE = 0.6;
const SLIDE_X = 62; // %
const SLIDE_LIFT = 60; // px（手前へ持ち上がる）
const SLIDE_BACK = -40; // px（束の後ろへ回る）
const SLIDE_ROTATE = 7; // deg
const SLIDE_TRAVEL = 0.62; // ページ幅に対する指の移動距離

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

/** 見開き用：めくり具合（0 = 右ページの位置 / 1 = 左ページの位置）から紙の姿勢を作る */
function bookTransform(progress) {
    const angle = TILT + progress * (180 - TILT * 2);
    const lift = Math.sin(progress * Math.PI) * LIFT;
    return `rotateY(${-angle}deg) translateZ(${lift}px)`;
}

/**
 * 紙束用：一番手前の紙を横へ抜いて、そのまま束の後ろへ回す。
 * 0 = 束の一番手前 / SLIDE_PHASE = 横に抜けきったところ / 1 = 束の一番後ろ
 */
function stackParts(progress) {
    const slide = Math.sin((Math.min(progress, SLIDE_PHASE) / SLIDE_PHASE) * (Math.PI / 2));
    const settle = progress <= SLIDE_PHASE ? 0 : (progress - SLIDE_PHASE) / (1 - SLIDE_PHASE);
    return {
        x: -SLIDE_X * (slide - settle),
        z: 1 + slide * SLIDE_LIFT + settle * (SLIDE_BACK - SLIDE_LIFT - 1),
        tilt: -SLIDE_ROTATE * (slide - settle),
    };
}

function stackTransform(progress) {
    const { x, z, tilt } = stackParts(progress);
    return `translateX(${x.toFixed(2)}%) translateZ(${z.toFixed(2)}px) rotate(${tilt.toFixed(2)}deg)`;
}

/** 持ち上がった高さに応じて影を伸ばす（紙が浮けば影は遠く・淡く・ぼける） */
function stackShadow(progress) {
    const height = Math.max(stackParts(progress).z, 0);
    const y = 1.5 + height * 0.22;
    const blur = 5 + height * 0.5;
    const alpha = 0.16 + Math.min(height / SLIDE_LIFT, 1) * 0.1;
    // 1層目＝紙同士の接地影、2層目＝浮いた高さぶんの落ち影
    return `0 1px 2px rgba(74, 59, 50, 0.16), 0 ${y.toFixed(1)}px ${blur.toFixed(1)}px rgba(74, 59, 50, ${alpha.toFixed(3)})`;
}

function transformAt(progress, single) {
    return single ? stackTransform(progress) : bookTransform(progress);
}

/** 経路を等間隔にサンプリングしてキーフレームにする */
function framesBetween(from, to, single) {
    const steps = single ? 12 : 2;
    return Array.from({ length: steps + 1 }, (_, i) => {
        const offset = i / steps;
        const progress = from + (to - from) * offset;
        const frame = { transform: transformAt(progress, single), offset };
        if (single) frame.boxShadow = stackShadow(progress);
        return frame;
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function isSinglePage() {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia(SINGLE_PAGE_MQ).matches
    );
}

function prefersReducedMotion() {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
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
                    <img src={item.thumbnail} alt={item.title} className={styles.photo} draggable={false} />
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

/** 右ページ（作品の記述）。見出しが作品へのリンクになる */
function RightPage({ item, index }) {
    if (!item) return <div className={styles.pageInner} />;

    return (
        <div className={styles.pageInner}>
            <p className={styles.chapter}>Makes</p>

            <h3 className={styles.title}>
                {item.externalUrl ? (
                    <Link
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.titleLink}
                        aria-label={`${item.title} を新しいタブで開く`}
                    >
                        {item.title}
                        <span className={styles.openMark}>↗</span>
                    </Link>
                ) : (
                    item.title
                )}
            </h3>
            <span className={styles.rule} aria-hidden="true" />

            {item.thumbnail && (
                <div className={styles.mobilePhoto}>
                    <img src={item.thumbnail} alt="" className={styles.photo} draggable={false} />
                </div>
            )}

            {item.description && <p className={styles.description}>{item.description}</p>}

            <div className={styles.techArea}>
                <TechBadgeList techStack={item.techStack} limit={4} />
            </div>

            <span className={styles.folio}>{index * 2 + 2}</span>
        </div>
    );
}

export default function MakesBook({ items }) {
    const list = items || [];
    const total = list.length;

    const [index, setIndex] = useState(0);
    // flip: { dir: 'next' | 'prev', from, to, mode: 'auto' | 'drag' }
    const [flip, setFlip] = useState(null);
    const [paused, setPaused] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [soundOff, setSoundOff] = useState(false);
    const spreadRef = useRef(null);
    const sheetRef = useRef(null);
    const animRef = useRef(null);
    const dragRef = useRef(null);
    // ドラッグでめくったときは、そのまま続くクリック（リンク）を打ち消す
    const suppressClickRef = useRef(false);

    const nextIndex = useCallback(
        (dir) => (dir === 'next' ? (index + 1) % total : (index - 1 + total) % total),
        [index, total]
    );

    // 保存されているミュート設定を反映する
    useEffect(() => {
        setSoundOff(isMuted());
    }, []);

    const turn = useCallback(
        (dir, options) => {
            if (total < 2) return;
            const silent = Boolean(options && options.silent);
            setFlip((current) => {
                if (current) return current; // めくり中は無視
                // 紙が動き出すのに合わせて鳴らす（自動めくりは鳴らさない）
                if (!silent) playRustle(0.9);
                return { dir, from: index, to: nextIndex(dir), mode: 'auto' };
            });
        },
        [index, total, nextIndex]
    );

    // ボタン／キー操作でのめくり（進む・戻るで同じ軌道を順・逆再生）
    useIsoLayoutEffect(() => {
        if (!flip) {
            if (animRef.current) {
                animRef.current.cancel();
                animRef.current = null;
            }
            if (sheetRef.current) {
                sheetRef.current.style.transform = '';
                sheetRef.current.style.boxShadow = '';
            }
            return undefined;
        }
        if (flip.mode !== 'auto') return undefined;

        const el = sheetRef.current;
        const commit = () => {
            setIndex(flip.to);
            setFlip(null);
        };

        if (!el || typeof el.animate !== 'function') {
            const id = setTimeout(commit, FLIP_MS);
            return () => clearTimeout(id);
        }

        const single = isSinglePage();
        const frames =
            flip.dir === 'next' ? framesBetween(0, 1, single) : framesBetween(1, 0, single);

        const anim = el.animate(frames, {
            duration: prefersReducedMotion() ? 1 : FLIP_MS,
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
        const id = setTimeout(() => turn('next', { silent: true }), AUTOPLAY_MS);
        return () => clearTimeout(id);
    }, [paused, total, flip, turn]);

    // ===== 指／マウスでページをつまんでめくる =====

    /** 綴じ目の位置とページ幅（片ページ表示のときは綴じ目が左端） */
    const geometry = useCallback(() => {
        const rect = spreadRef.current.getBoundingClientRect();
        const single = isSinglePage();
        return {
            rect,
            gutterX: single ? rect.left : rect.left + rect.width / 2,
            width: single ? rect.width : rect.width / 2,
            single,
        };
    }, []);

    /** 紙の端がポインタに付いてくるように、X座標からめくり具合を求める */
    const progressFromX = useCallback((clientX, geo) => {
        const ratio = clamp((clientX - geo.gutterX) / geo.width, -1, 1);
        return Math.acos(ratio) / Math.PI;
    }, []);

    /** 紙束モード：指の移動距離をそのまま「後ろへ回す」進捗に割り当てる */
    const stackProgress = useCallback((dx, dir, width) => {
        const travel = SLIDE_TRAVEL * width;
        return dir === 'next' ? clamp(-dx / travel, 0, 1) : 1 - clamp(dx / travel, 0, 1);
    }, []);

    const handlePointerDown = useCallback(
        (event) => {
            suppressClickRef.current = false;
            if (total < 2 || flip || dragRef.current) return;
            if (event.pointerType === 'mouse' && event.button !== 0) return; // 左ボタンのみ
            if (event.target.closest('button')) return;

            const geo = geometry();
            const relative = (event.clientX - geo.rect.left) / geo.rect.width;
            const dir = relative < (geo.single ? 0.3 : 0.5) ? 'prev' : 'next';

            dragRef.current = {
                dir,
                geo,
                // リンクの上から始めた場合、動かさずに離したらリンクを優先する
                onLink: Boolean(event.target.closest('a')),
                moved: false,
                to: nextIndex(dir),
                pointerId: event.pointerId,
                startX: event.clientX,
                lastX: event.clientX,
                lastAt: performance.now(),
                velocity: 0,
                progress: dir === 'next' ? 0 : 1,
                engaged: false,
            };
            setPaused(true);
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        [total, flip, geometry, nextIndex]
    );

    const handlePointerMove = useCallback(
        (event) => {
            const drag = dragRef.current;
            if (!drag || event.pointerId !== drag.pointerId) return;

            const dx = event.clientX - drag.startX;
            if (Math.abs(dx) >= DRAG_START_PX) drag.moved = true;
            if (!drag.engaged) {
                if (Math.abs(dx) < DRAG_START_PX) return;
                // 進むなら左へ、戻るなら右へ動かしたときだけ紙を持ち上げる
                if ((drag.dir === 'next' && dx > 0) || (drag.dir === 'prev' && dx < 0)) return;
                drag.engaged = true;
                setDragging(true);
                playRustle(0.5); // 紙を持ち上げる音
                setFlip({ dir: drag.dir, from: index, to: drag.to, mode: 'drag' });
            }

            const now = performance.now();
            drag.velocity = (event.clientX - drag.lastX) / Math.max(now - drag.lastAt, 1);
            drag.lastX = event.clientX;
            drag.lastAt = now;
            drag.progress = drag.geo.single
                ? stackProgress(dx, drag.dir, drag.geo.width)
                : progressFromX(event.clientX, drag.geo);

            if (sheetRef.current) {
                sheetRef.current.style.transform = transformAt(drag.progress, drag.geo.single);
                sheetRef.current.style.boxShadow = drag.geo.single ? stackShadow(drag.progress) : '';
            }
        },
        [index, progressFromX, stackProgress]
    );

    const finishDrag = useCallback(
        (event, cancelled) => {
            const drag = dragRef.current;
            if (!drag || event.pointerId !== drag.pointerId) return;
            dragRef.current = null;
            setPaused(false);
            try {
                event.currentTarget.releasePointerCapture(drag.pointerId);
            } catch {
                /* すでに解放済み */
            }

            suppressClickRef.current = drag.moved;

            // ほとんど動いていなければタップ扱いでめくる。
            // ただしリンクの上なら、そのリンクを開く方を優先する
            if (!drag.engaged) {
                if (!cancelled && !drag.onLink && !drag.moved) turn(drag.dir);
                return;
            }

            setDragging(false);

            const el = sheetRef.current;
            const towardEnd =
                (drag.dir === 'next' && drag.velocity < 0) || (drag.dir === 'prev' && drag.velocity > 0);
            const flicked = Math.abs(drag.velocity) > FLICK_VELOCITY && towardEnd;
            const passedHalf = drag.dir === 'next' ? drag.progress > 0.5 : drag.progress < 0.5;
            const complete = !cancelled && (flicked || passedHalf);

            // 払った勢いが強いほど大きく鳴らす
            playRustle(complete ? 0.8 + Math.min(Math.abs(drag.velocity), 1.5) * 0.25 : 0.3);

            const target = drag.dir === 'next' ? (complete ? 1 : 0) : complete ? 0 : 1;
            const settle = () => {
                if (complete) setIndex(drag.to);
                setFlip(null);
            };

            if (!el || typeof el.animate !== 'function') {
                settle();
                return;
            }

            const anim = el.animate(framesBetween(drag.progress, target, drag.geo.single), {
                duration: prefersReducedMotion()
                    ? 1
                    : Math.max(160, Math.round(FLIP_MS * Math.abs(target - drag.progress))),
                easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
                fill: 'forwards',
            });
            animRef.current = anim;
            anim.onfinish = settle;
        },
        [turn]
    );

    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === 'ArrowRight' || event.key === 'PageDown') {
                event.preventDefault();
                turn('next');
            } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
                event.preventDefault();
                turn('prev');
            }
        },
        [turn]
    );

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

    const bookClass = [styles.book, total > 1 ? styles.bookGrabbable : '', dragging ? styles.bookDragging : '']
        .filter(Boolean)
        .join(' ');
    const sheetClass = `${styles.sheet}${flip ? ` ${styles.sheetVisible}` : ''}`;

    return (
        <div className={styles.bookWrapper}>
            <div
                className={bookClass}
                role="group"
                aria-label="Makes の作品を収めた本。ドラッグまたは左右キーでページをめくれます"
                tabIndex={0}
                onClickCapture={(event) => {
                    if (!suppressClickRef.current) return;
                    suppressClickRef.current = false;
                    event.preventDefault();
                    event.stopPropagation();
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={(event) => finishDrag(event, false)}
                onPointerCancel={(event) => finishDrag(event, true)}
                onKeyDown={handleKeyDown}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocus={() => setPaused(true)}
                onBlur={() => setPaused(false)}
            >
                <div className={styles.spread} ref={spreadRef}>
                    {total > 1 && (
                        <>
                            <span className={`${styles.underSheet} ${styles.underSheetC}`} aria-hidden="true" />
                            <span className={`${styles.underSheet} ${styles.underSheetB}`} aria-hidden="true" />
                            <span className={`${styles.underSheet} ${styles.underSheetA}`} aria-hidden="true" />
                        </>
                    )}
                    <div
                        className={`${styles.page} ${styles.pageLeft}`}
                        style={{ '--leaf-stack': leafStack(leftLeaves, -1) }}
                    >
                        <LeftPage item={list[staticLeft]} index={staticLeft} total={total} />
                    </div>
                    <div
                        className={`${styles.page} ${styles.pageRight}`}
                        style={{ '--leaf-stack': leafStack(rightLeaves, 1) }}
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

                {total > 1 && <span className={styles.curl} aria-hidden="true" />}
            </div>

            <div className={styles.controls}>
                <div className={styles.counterRow}>
                    <span className={styles.counter} aria-live="polite">
                        {String(index + 1).padStart(2, '0')} <em>/</em> {String(total).padStart(2, '0')}
                    </span>
                    <button
                        type="button"
                        className={styles.soundToggle}
                        onClick={() => {
                            const next = !soundOff;
                            setMuted(next);
                            setSoundOff(next);
                            if (!next) playRustle(0.6); // 音を戻したら手応えを返す
                        }}
                        aria-pressed={soundOff}
                        aria-label={soundOff ? 'めくる音を鳴らす' : 'めくる音を消す'}
                        title={soundOff ? 'めくる音を鳴らす' : 'めくる音を消す'}
                    >
                        {soundOff ? '🔇' : '🔊'}
                    </button>
                </div>
                {total > 1 && <span className={styles.hint}>ページの端をつまんでめくる</span>}
            </div>

            <div className={styles.moreButtonWrapper}>
                <Link href="/makes" className={styles.moreButton}>
                    All Makes
                </Link>
            </div>
        </div>
    );
}
