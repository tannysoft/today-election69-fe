import PartiesRightRow from './PartiesRightRow';
import styles from './PartiesRightSidebar.module.css';

export default function PartiesRightSidebar({ parties }) {
    // Top 7 parties
    const displayParties = parties.slice(0, 7);

    // Find max score (totalSeats) among the displayed parties to normalize width
    // Use 1 as fallback to prevent division by zero
    const maxScore = Math.max(...displayParties.map(p => p.score || 0), 1);

    return (
        <div className={styles.sidebarContainer}>
            {displayParties.map((party, index) => {
                // Calculate percentage relative to the top party (maxScore)
                // Rank 1 will always be 100%
                const relativePercentage = maxScore > 0 ? ((party.score || 0) / maxScore) * 100 : 0;

                return (
                    <PartiesRightRow
                        key={party.id || party.name}
                        rank={index + 1}
                        name={party.name}
                        logoUrl={party.logoUrl}
                        score={party.score}
                        color={party.color}
                        percentage={relativePercentage}
                        delay={index * 0.1}
                    />
                );
            })}
        </div>
    );
}
