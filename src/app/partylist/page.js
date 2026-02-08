"use client";

import { useState, useEffect, useMemo } from 'react';
import { getPartylistResult, getNationalPartylistTotal } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
// import pb from '@/lib/pocketbase'; // Removed
import ScoreCard from '@/components/LowerThird/ScoreCard';
import CountUp from 'react-countup';
import styles from './page.module.css';

export default function PartyListPage() {
    const [allParties, setAllParties] = useState([]);
    const [hideZeroScore, setHideZeroScore] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState('auto'); // auto, manual
    const [manualIndex, setManualIndex] = useState(0);
    const [countDisplayMode, setCountDisplayMode] = useState('votes');
    const [countedData, setCountedData] = useState({ totalVotes: 0, percent: 0 });

    const fetchData = async () => {
        const [data, nationalData] = await Promise.all([
            getPartylistResult(),
            getNationalPartylistTotal()
        ]);
        setAllParties(data);
        setCountedData({
            totalVotes: nationalData.totalVotes,
            percent: nationalData.percent
        });
    };

    const fetchSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings) {
                setHideZeroScore(settings.hide_zero_score);
                const mode = settings.partylist_mode || 'auto';
                const idx = Number(settings.partylist_index) || 0;
                const cMode = settings.count_display_mode || 'votes';

                setViewMode(mode);
                setManualIndex(idx);
                setCountDisplayMode(cMode);

                if (mode === 'manual') setCurrentIndex(idx);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    useEffect(() => {
        const loadAll = () => {
            fetchData();
            fetchSettings();
        };

        loadAll();
        const interval = setInterval(loadAll, 30000); // 30 seconds polling

        return () => {
            clearInterval(interval);
        };
    }, []);

    // Filter Logic
    const parties = useMemo(() => {
        if (hideZeroScore) {
            return allParties.filter(p => p.score > 0);
        }
        return allParties;
    }, [allParties, hideZeroScore]);

    useEffect(() => {
        if (parties.length === 0) return;

        // Manual Mode
        if (viewMode === 'manual') {
            setCurrentIndex(manualIndex);
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.ceil(parties.length / 7);
                if (maxIndex === 0) return 0;
                return (prev + 1) % maxIndex;
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [parties.length, viewMode, manualIndex]);

    // Reset index if it goes out of bounds when toggling filter
    useEffect(() => {
        if (viewMode === 'manual') return; // Don't auto-reset in manual mode unless imperative? actually safe check is good.

        const maxIndex = Math.ceil(parties.length / 7);
        if (currentIndex >= maxIndex && maxIndex > 0) {
            setCurrentIndex(0);
        }
    }, [parties.length]);

    const visibleParties = parties.slice(currentIndex * 7, (currentIndex + 1) * 7);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>คะแนน สส.บัญชีรายชื่อ</div>
                <div className={styles.subtitle}>
                    นับแล้ว <span style={{ color: 'white' }}>
                        {countDisplayMode === 'votes' ? (
                            <CountUp end={countedData.totalVotes} separator="," duration={1} />
                        ) : (
                            <><CountUp end={countedData.percent} decimals={2} duration={1} />%</>
                        )}
                    </span>
                </div>
            </div>

            <div className={styles.listContainer}>
                {visibleParties.map((party, index) => {
                    const currentRank = (currentIndex * 7) + index + 1;
                    return (
                        <div key={party.name} className={styles.rowWrapper}>

                            <div className={styles.cardScaleWrapper}>
                                <ScoreCard
                                    rank={currentRank} // Show internal rank
                                    name={party.name}
                                    title=""
                                    firstName=""
                                    lastName=""
                                    party={party.name} // Pass party name to trigger BG SVG load
                                    hidePartyLabel={true} // Hide the subtitle text (duplicate of main name)
                                    score={party.score}
                                    color={party.color}
                                    image={party.logoUrl}
                                    partyLogoUrl={null}
                                    rankPosition="top" // default
                                    imageCentered={true} // Center logo image
                                    nameFontSize="3rem" // Larger party name
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
