// import Image from 'next/image'; // USER REQUEST: Use standard img tag
import CountUp from 'react-countup';
import styles from './LowerThird.module.css';

export default function ScoreCard({ rank, name, party, score, color, image }) {
    // Check if color is a hex code (starts with #)
    const isHex = color?.startsWith('#');
    const colorClass = !isHex ? ({
        orange: styles.bgOrange,
        red: styles.bgRed,
        blue: styles.bgBlue,
        green: styles.bgGreen
    }[color] || styles.bgOrange) : '';

    return (
        <div
            className={`${styles.card} ${styles.fadeUpAnimation} ${rank === 1 ? styles.rank1 : ''}`}
            style={{ animationDelay: `${(rank - 1) * 0.15}s` }}
        >
            {/* Portrait */}
            <div className={styles.portraitCircle}>
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'top'
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#ccc' }} />
                )}
            </div>

            {/* Content Area */}
            <div
                className={`${styles.cardContent} ${colorClass}`}
                style={isHex ? { background: color } : {}}
            >
                <div className={styles.textGroup}>
                    <div className={`${styles.name} ${styles.wipeFadeAnimation}`} style={{ animationDelay: `${(rank - 1) * 0.15 + 0.3}s` }}>{name}</div>
                    <div className={`${styles.party} ${styles.wipeFadeAnimation}`} style={{ animationDelay: `${(rank - 1) * 0.15 + 0.4}s` }}>{party}</div>
                </div>
                <div className={styles.scoreGroup}>
                    <div className={styles.score}>
                        <CountUp end={score} duration={1} separator="," />
                    </div>
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
