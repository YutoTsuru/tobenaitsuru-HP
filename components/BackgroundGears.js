'use client';

import Gear from './Gear';
import styles from './BackgroundGears.module.css';

// Solarpunk / Warm Cyberpunk Gears
export default function BackgroundGears() {
    return (
        <div className={styles.container}>
            {/* Top Right Cluster */}
            <div className={styles.clusterTopRight}>
                <Gear size={300} color="var(--c-gear-gold)" style={{ opacity: 0.15 }} duration={60} />
            </div>

            {/* Bottom Left Cluster */}
            <div className={styles.clusterBottomLeft}>
                <div style={{ position: 'absolute', bottom: -50, left: -50 }}>
                    <Gear size={400} color="var(--c-gear-copper)" style={{ opacity: 0.1 }} duration={80} />
                </div>
                <div style={{ position: 'absolute', bottom: 180, left: 180 }}>
                    <Gear size={150} color="var(--c-gear-gold)" style={{ opacity: 0.2 }} duration={40} reverse={true} />
                </div>
                <div style={{ position: 'absolute', bottom: 100, left: 250 }}>
                    <Gear size={100} color="var(--c-gear-silver)" style={{ opacity: 0.3 }} duration={30} />
                </div>
            </div>

            {/* Top Right Fixed Position overrides */}
            <div style={{ position: 'fixed', top: -100, right: -100, opacity: 0.1, zIndex: -1 }}>
                <Gear size={500} color="var(--c-gear-copper)" duration={120} reverse={true} />
            </div>
            <div style={{ position: 'fixed', top: 200, right: 50, opacity: 0.15, zIndex: -1 }}>
                <Gear size={200} color="var(--c-gear-gold)" duration={50} />
            </div>
        </div>
    );
}
