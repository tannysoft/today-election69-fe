import { useState, useEffect } from 'react';
import styles from './PartiesRightSidebar.module.css';

export default function PartiesRightRow({ rank, name, logoUrl, score, color, percentage, delay }) {
    // Start at 0 width for animation
    const [width, setWidth] = useState('0%');

    useEffect(() => {
        // Delay before starting animation (plus staggered delay)
        const timer = setTimeout(() => {
            setWidth(`${percentage || 0}%`);
        }, (delay * 1000) + 100); // converting sec to ms + default delay

        return () => clearTimeout(timer);
    }, [percentage, delay]);

    return (
        <div
            className={`${styles.partyRow} ${styles.animFadeIn}`}
            style={{ animationDelay: `${delay}s` }}
        >
            <div className={styles.rank}>{rank}</div>
            <div className={styles.barContainer}>
                {/* Progress Fill Layer */}
                <div
                    className={styles.progressFill}
                    style={{
                        width: width,
                        backgroundColor: color || '#888'
                    }}
                />

                {/* Content Layer */}
                <div className={styles.contentLayer}>
                    <div className={styles.leftSection}>
                        <div className={styles.logoCircle}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl || "/placeholder_party.png"} alt={name} className={styles.partyLogo} />
                        </div>
                    </div>
                    <div className={styles.rightSection}>
                        <div className={styles.partyName}>{name}</div>
                        <div className={styles.partyScore}>{score ? score.toLocaleString() : 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
