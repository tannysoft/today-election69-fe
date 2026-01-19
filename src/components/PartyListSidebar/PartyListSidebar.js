import PartyRow from './PartyRow';
import styles from './PartyListSidebar.module.css';

export default function PartyListSidebar({ parties }) {
    // Take top 5 or 6 to fit the screen
    const displayParties = parties.slice(0, 5);

    return (
        <div className={styles.sidebarContainer}>
            {displayParties.map((party) => (
                <PartyRow key={party.name} {...party} />
            ))}
        </div>
    );
}
