
import React from 'react';
import CountUp from 'react-countup';
import styles from './ReferendumBar.module.css';

export default function ReferendumBar({ approve, disapprove, noVote, badCards, totalCounted, title }) {
    const renderScore = (value) => {
        return <CountUp end={value || 0} separator="," duration={2} />;
    };

    const totalVotes = (approve || 0) + (disapprove || 0);
    const approvePercent = totalVotes > 0 ? ((approve || 0) / totalVotes) * 100 : 0;
    const disapprovePercent = totalVotes > 0 ? ((disapprove || 0) / totalVotes) * 100 : 0;

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
                                {renderScore(approve)}
                            </div>
                        </div>
                        <div className={styles.greyBar}>
                            <div className={styles.barFillAgree} style={{ width: `${approvePercent}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Disagree Section (Right) */}
                <div className={styles.disagreeContainer}>
                    <div className={styles.contentColumn}>
                        <div className={`${styles.textRow} ${styles.textRowRight}`}>
                            <div className={styles.scoreBox}>
                                {renderScore(disapprove)}
                            </div>
                            <div className={styles.label}>ไม่เห็นชอบ</div>
                        </div>
                        <div className={styles.greyBar}>
                            <div className={styles.barFillDisagree} style={{ width: `${disapprovePercent}%` }}></div>
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
                    <div className={styles.bottomValueBox}>{renderScore(noVote)}</div>
                </div>

                <div className={styles.bottomItem}>
                    <span className={styles.bottomLabel}>บัตรเสีย</span>
                    <div className={styles.bottomValueBox}>{renderScore(badCards)}</div>
                </div>

                <div className={styles.bottomItem}>
                    <span className={styles.bottomLabel}>นับแล้ว</span>
                    <div className={styles.bottomValueBox}>{renderScore(totalCounted)}</div>
                </div>
            </div>
        </div>
    );
}
