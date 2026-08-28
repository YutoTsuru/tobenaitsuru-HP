'use client';

/**
 * 紙をめくる音を WebAudio で合成する。
 * 音源ファイルは持たず、短いノイズの粒を重ねて乾いた紙の擦れを作る。
 * 自動再生の制約があるため、AudioContext は最初のユーザー操作時に作る。
 */

const STORAGE_KEY = 'makes-book-sound';
const NOISE_SECONDS = 0.6;

let context = null;
let noiseBuffer = null;
let muted = false;
let initialized = false;

/** 保存されている設定を読む（初回だけ） */
export function isMuted() {
    if (!initialized && typeof window !== 'undefined') {
        initialized = true;
        try {
            muted = window.localStorage.getItem(STORAGE_KEY) === 'off';
        } catch {
            muted = false;
        }
    }
    return muted;
}

export function setMuted(value) {
    muted = value;
    initialized = true;
    try {
        window.localStorage.setItem(STORAGE_KEY, value ? 'off' : 'on');
    } catch {
        /* 保存できなくても音の切り替え自体は効く */
    }
}

function getContext() {
    if (context) return context;
    const Ctor = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!Ctor) return null;
    context = new Ctor();
    return context;
}

function getNoise(ctx) {
    if (noiseBuffer) return noiseBuffer;
    const length = Math.floor(ctx.sampleRate * NOISE_SECONDS);
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
        data[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
}

/**
 * 短い粒を 1 つ鳴らす。紙のパリッとした鳴りは、立ち上がりの速さと高域で決まる。
 */
function grain(ctx, destination, at, { duration, frequency, q, peak }) {
    const source = ctx.createBufferSource();
    source.buffer = getNoise(ctx);
    source.playbackRate.value = 0.8 + Math.random() * 0.6;
    // 毎回ノイズの違う場所を読む
    const offset = Math.random() * (NOISE_SECONDS - duration - 0.01);

    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = frequency;
    band.Q.value = q;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    // 3ms 程度で立ち上げる。速すぎるとパチパチした点の音になる
    gain.gain.linearRampToValueAtTime(peak, at + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    source.connect(band).connect(gain).connect(destination);
    source.start(at, offset, duration + 0.01);
    source.stop(at + duration + 0.02);
}

/**
 * 紙をめくる音を一度鳴らす。
 * なめらかな一発ではなく、短い粒を不揃いに重ねて乾いた擦れにする。
 * @param {number} intensity 0〜1.2 程度。持ち上げは弱く、めくり切りは強く
 */
export function playRustle(intensity = 1) {
    if (isMuted()) return;

    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const strength = Math.max(0.15, Math.min(intensity, 1.2));

    // 低域を切って紙らしい軽さを出す
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 850;

    // 上を少し丸めて、シャリつきを乾いた質感に寄せる
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 9000;
    lowpass.Q.value = 0.6;

    const master = ctx.createGain();
    master.gain.value = 0.42 * strength;
    highpass.connect(lowpass).connect(master).connect(ctx.destination);

    // 粒を重なるくらい密に並べる。粒が分離すると点の音、重なると乾いた擦れになる
    const count = 7 + Math.round(strength * 6);
    let at = now;
    for (let i = 0; i < count; i += 1) {
        const position = i / count;
        // 単調に減衰させず、揺らして不均一な擦れにする
        const wobble = (1 - position * 0.45) * (0.65 + Math.random() * 0.5);
        grain(ctx, highpass, at, {
            duration: 0.016 + Math.random() * 0.03,
            frequency: 1500 + Math.random() * 3000,
            // Q を下げるほど音程感が消えて、乾いた紙の擦れに近づく
            q: 0.5 + Math.random() * 0.8,
            peak: (0.05 + Math.random() * 0.05) * wobble,
        });
        at += 0.006 + Math.random() * 0.016;
    }

    // 最後に紙が落ち着く一撫で
    grain(ctx, highpass, at, {
        duration: 0.07 + strength * 0.04,
        frequency: 1300 + Math.random() * 800,
        q: 0.5,
        peak: 0.045,
    });
}
