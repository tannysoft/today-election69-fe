
import React from 'react';
import CountUp from 'react-countup';
import styles from './ReferendumBar.module.css';

const ThumbsUpIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 2.14-1.17l3.07-7.22c.11-.26.19-.55.19-.85V10z" />
    </svg>
);

const ThumbsDownIcon = () => (
    <svg viewBox="0 0 24 24">
        <path d="M15 3H6c-.83 0-1.54.5-2.14 1.17l-3.07 7.22c-.11.26-.19.55-.19.85v1c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
    </svg>
);

export default function ReferendumBar({ approve, disapprove, noVote, title }) {
    return (
        <div className={styles.container}>
            {/* Main White Bar */}
            <div className={styles.mainBar}>
                {/* Left Absolute Icon */}
                <div className={`${styles.iconCircle} ${styles.iconLeft}`}>
                    <div className={styles.icon}>
                        <ThumbsUpIcon />
                    </div>
                </div>

                {/* Left Content */}
                <div className={styles.leftSection}>
                    <div className={`${styles.score} ${styles.scoreBlack}`}>
                        <CountUp end={approve} separator="," duration={2} />
                    </div>
                    <div className={styles.label}>เห็นชอบ</div>
                </div>

                {/* Vertical Divider */}
                <div className={styles.divider}></div>

                {/* Right Content */}
                <div className={styles.rightSection}>
                    <div className={styles.label}>ไม่เห็นชอบ</div>
                    <div className={`${styles.score} ${styles.scoreBlack}`}>
                        <CountUp end={disapprove} separator="," duration={2} />
                    </div>
                </div>

                {/* Right Absolute Icon */}
                <div className={`${styles.iconCircle} ${styles.iconRight}`}>
                    <div className={styles.icon}>
                        <ThumbsDownIcon />
                    </div>
                </div>
            </div>

            {/* Bottom Bar: No Vote */}
            <div className={styles.abstainBar}>
                <span className={styles.abstainLabel}>ไม่ประสงค์ลงคะแนน</span>
                <div className={styles.abstainScoreBox}>
                    <CountUp end={noVote} separator="," duration={2} />
                </div>
            </div>
        </div>
    );
}
