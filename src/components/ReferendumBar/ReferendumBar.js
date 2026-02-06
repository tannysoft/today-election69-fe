
import React from 'react';
import CountUp from 'react-countup';
import styles from './ReferendumBar.module.css';

export default function ReferendumBar({ agree, disagree, noVote, badCards, totalCounted, title, isPercent = false }) {
    const renderScore = (value, forceVotes = false) => {
        const showPercent = isPercent && !forceVotes;
        return (
            <>
                <CountUp end={value || 0} separator="," decimals={showPercent ? 2 : 0} duration={2} />
                {showPercent && "%"}
            </>
        );
    };

    const totalVotes = (agree || 0) + (disagree || 0);
    const agreePercent = totalVotes > 0 ? ((agree || 0) / totalVotes) * 100 : 0;
    const disagreePercent = totalVotes > 0 ? ((disagree || 0) / totalVotes) * 100 : 0;

    return (
        <div className={styles.container}>
            {/* Top Row: Two main blocks */}
            <div className={styles.topRow}>
                {/* Agree Section (Left) */}
                <div className={styles.agreeContainer}>
                    <div className={styles.iconBoxAgree}>
                        <img src="/referendum/agree.svg" alt="Agree" className={styles.iconImg} />
                    </div>
                    {/* Content Column: Text Above + Grey Bar Below */}
                    <div className={styles.contentColumn}>
                        <div className={styles.textRow}>
                            <div className={styles.label}>เห็นชอบ</div>
                            <div className={styles.scoreBox}>
                                {renderScore(agree)}
                            </div>
                        </div>
                        <div className={styles.greyBar}>
                            <div className={styles.barFillAgree} style={{ width: `${agreePercent}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Disagree Section (Right) */}
                <div className={styles.disagreeContainer}>
                    <div className={styles.contentColumn}>
                        <div className={`${styles.textRow} ${styles.textRowRight}`}>
                            <div className={styles.scoreBox}>
                                {renderScore(disagree)}
                            </div>
                            <div className={styles.label}>ไม่เห็นชอบ</div>
                        </div>
                        <div className={styles.greyBar}>
                            <div className={styles.barFillDisagree} style={{ width: `${disagreePercent}%` }}></div>
                        </div>
                    </div>
                    <div className={styles.iconBoxDisagree}>
                        <img src="/referendum/disagree.svg" alt="Disagree" className={styles.iconImg} />
                    </div>
                </div>
            </div>

            {/* Bottom Bar: 3 Stats */}
            <div className={styles.bottomBar}>
                <div className={styles.bottomItem}>
                    <span className={styles.bottomLabel}>ไม่ประสงค์ลงคะแนน</span>
                    <div className={styles.bottomValueBox}>{renderScore(noVote, true)}</div>
                </div>

                <div className={styles.bottomItem}>
                    <span className={styles.bottomLabel}>บัตรเสีย</span>
                    <div className={styles.bottomValueBox}>{renderScore(badCards, true)}</div>
                </div>

                <div className={styles.bottomItem}>
                    <span className={styles.bottomLabel}>นับแล้ว</span>
                    <div className={styles.bottomValueBox}>{renderScore(totalCounted)}</div>
                </div>
            </div>
        </div>
    );
}
