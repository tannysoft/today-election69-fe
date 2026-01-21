import styles from './LowerThird.module.css';
import ScoreCard from './ScoreCard';

export default function LowerThird({ areaName, candidates = [], isExiting = false }) {
    // If no candidates, we can show nothing or placeholders
    // For now, we expect the parent to pass valid data
    const displayCandidates = candidates.length > 0 ? candidates : [];

    return (
        <div className={`${styles.lowerThirdContainer} ${isExiting ? styles.exitAnimation : ''}`}>
            <div className={styles.cardsRow}>
                {displayCandidates.map((c) => (
                    <ScoreCard
                        key={`${areaName}-${c.rank}`}
                        {...c}
                    />
                ))}
            </div>
            <div className={styles.barContainer}>
                <span className={styles.areaNameText}>{areaName || "รอผลการเลือกตั้ง"}</span>
            </div>
        </div>
    );
}
