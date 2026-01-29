"use client";

import { useState, useEffect, useMemo } from 'react';
import { getPartylistResult } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
import pb from '@/lib/pocketbase';
import ScoreCard from '@/components/LowerThird/ScoreCard';
import styles from './page.module.css';

export default function PartyListPage() {
    const [allParties, setAllParties] = useState([]);
    const [hideZeroScore, setHideZeroScore] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchData = async () => {
        const data = await getPartylistResult();
        // data.sort((a, b) => b.score - a.score); // Sorting is now done in the query
        setAllParties(data);
    };

    const fetchSettings = async () => {
        try {
            const settings = await getSettings();
            if (settings) {
                setHideZeroScore(settings.hide_zero_score);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchSettings();

        // Subscriptions
        pb.collection('partylistResult').subscribe('*', () => fetchData());

        pb.collection('settings').subscribe('*', (e) => {
            if (e.action === 'update' || e.action === 'create') {
                setHideZeroScore(e.record.hide_zero_score);
            }
        });

        return () => {
            pb.collection('partylistResult').unsubscribe('*');
            pb.collection('settings').unsubscribe('*');
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
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.ceil(parties.length / 7);
                if (maxIndex === 0) return 0;
                return (prev + 1) % maxIndex;
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [parties.length]);

    // Reset index if it goes out of bounds when toggling filter
    useEffect(() => {
        const maxIndex = Math.ceil(parties.length / 7);
        if (currentIndex >= maxIndex && maxIndex > 0) {
            setCurrentIndex(0);
        }
    }, [parties.length]);

    const visibleParties = parties.slice(currentIndex * 7, (currentIndex + 1) * 7);
    const totalVotes = parties.reduce((acc, p) => acc + (p.score || 0), 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>คะแนน ส.ส.บัญชีรายชื่อ</div>
                <div className={styles.subtitle}>นับแล้ว <span style={{ color: 'white' }}>{totalVotes.toLocaleString()}</span></div>
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
