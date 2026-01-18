import styles from './LowerThird.module.css';
import ScoreCard from './ScoreCard';

export default function LowerThird({ areaName, show }) {
    const candidates = [
        {
            rank: 1,
            name: "นายอภิสิทธิ์ ดุจดา",
            party: "พรรคประชาชน",
            score: 54862,
            color: "orange",
            image: null
        },
        {
            rank: 2,
            name: "นายอภิสิทธิ์ ดุจดา",
            party: "พรรคเพื่อไทย",
            score: 54862,
            color: "red",
            image: null
        },
        {
            rank: 3,
            name: "นายอภิสิทธิ์ ดุจดา",
            party: "พรรคประชาธิปัตย์",
            score: 54862,
            color: "blue",
            image: null
        }
    ];

    return (
        <div className={styles.lowerThirdContainer}>
            <div className={styles.cardsRow}>
                {candidates.map((c) => (
                    <ScoreCard
                        key={c.rank}
                        {...c}
                    />
                ))}
            </div>
            <div className={styles.barContainer}>
                {areaName || "กรุงเทพมหานคร เขต 2"}
            </div>
        </div>
    );
}
