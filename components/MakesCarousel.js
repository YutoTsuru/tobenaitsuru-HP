'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import 'swiper/css/pagination';
import Image from 'next/image';
import Link from 'next/link';
import styles from './MakesCarousel.module.css';

export default function MakesCarousel({ items }) {
    if (!items || items.length === 0) {
        return (
            <div className={styles.empty}>
                <p>Coming Soon...</p>
            </div>
        );
    }

    return (
        <div className={styles.carouselWrapper}>
            <Swiper
                effect={'cards'}
                grabCursor={true}
                modules={[EffectCards, Autoplay, Pagination]}
                className={styles.swiper}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    dynamicBullets: true,
                }}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id} className={styles.slide}>
                        <div className={styles.card}>
                            <div className={styles.imageWrapper}>
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} alt={item.title} className={styles.image} />
                                ) : (
                                    <div className={styles.noImage}>No Image</div>
                                )}
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>{item.title}</h3>
                                {item.externalUrl ? (
                                    <a
                                        href={item.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.link}
                                    >
                                        View Project →
                                    </a>
                                ) : (
                                    <span className={styles.noLink}>View Details</span>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <div className={styles.moreButtonWrapper}>
                <Link href="/makes" className={styles.moreButton}>
                    All Makes
                </Link>
            </div>
        </div>
    );
}
