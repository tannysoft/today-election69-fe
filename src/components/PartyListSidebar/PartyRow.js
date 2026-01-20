import styles from './PartyListSidebar.module.css';
import CountUp from 'react-countup';

export default function PartyRow({ rank, name, count, color, logoUrl, leader }) {
    const isHex = color?.startsWith('#');
    // Helper to determine text color based on background brightness
    const getTextColor = (hex) => {
        if (!hex) return 'white'; // Default for gradients/missing
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 150) ? 'black' : 'white';
    };

    const textColor = isHex ? getTextColor(color) : 'white'; // Default white for preset gradients

    const colorStyle = isHex ? { background: color, color: textColor } : { color: textColor };

    const shadowStyle = textColor === 'white' ? { textShadow: 'none' } : {};

    // Map known colors to styles if not hex
    const colorClass = !isHex ? ({
        orange: styles.bgOrange,
        red: styles.bgRed,
        blue: styles.bgBlue,
        green: styles.bgGreen
    }[color] || styles.bgOrange) : '';

    return (
        <div
            className={`${styles.partyRow} ${styles.fadeUpAnimation}`}
            style={{ animationDelay: `${(rank - 1) * 0.15}s` }}
        >
            {/* Rank Number (Absolute or Outside) */}
            <div className={styles.rank}>{rank}</div>

            <div className={`${styles.rowContent} ${colorClass}`} style={colorStyle}>

                {/* 1. Party Logo (Left Bottom) */}
                <div className={styles.logoContainer}>
                    {logoUrl && <img src={logoUrl} alt={name} className={styles.partyLogo} />}
                </div>

                {/* 2. Leader Image (Center - Pop out) */}
                <div className={styles.leaderImageContainer}>
                    {leader ? (
                        <img src={leader} alt={`${name} Leader`} className={styles.leaderImage} />
                    ) : (
                        <div className={styles.placeholderImage} />
                    )}
                </div>

                {/* 3. Text Group (Right - Name Top, Score Bottom) */}
                <div className={styles.textGroup}>
                    <div className={styles.partyName} style={shadowStyle}>{name}</div>
                    <div className={styles.scoreValue} style={shadowStyle}>
                        <CountUp end={count} duration={1} separator="," />
                    </div>
                </div>

            </div>
        </div>
    );
}
