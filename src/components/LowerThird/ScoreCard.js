import Image from 'next/image';
import styles from './LowerThird.module.css';

export default function ScoreCard({ rank, name, party, score, color, imageSrc }) {
    const colorClass = {
        orange: styles.bgOrange,
        red: styles.bgRed,
        blue: styles.bgBlue,
        green: styles.bgGreen
    }[color] || styles.bgOrange;

    return (
        <div className={`${styles.card} ${rank === 1 ? styles.rank1 : ''}`}>
            {/* Portrait */}
            <div className={styles.portraitCircle}>
                {imageSrc ? (
                    <Image src={imageSrc} alt={name} width={130} height={130} />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#ccc' }} />
                )}
            </div>

            {/* Content Area */}
            <div className={`${styles.cardContent} ${colorClass}`}>
                <div className={styles.textGroup}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.party}>{party}</div>
                </div>
                <div className={styles.scoreGroup}>
                    <div className={styles.score}>{score.toLocaleString()}</div>
                    <div className={styles.scoreLabel}>คะแนน</div>
                </div>
            </div>

            {/* Rank Badge */}
            <div className={styles.rankCircle}>
                {rank}
            </div>
        </div>
    );
}
