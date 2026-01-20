"use client";

import { useState, useEffect, useMemo } from 'react';
import ScoreCard from '@/components/LowerThird/ScoreCard';
import { getElectionData } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
import pb from '@/lib/pocketbase';
import styles from './page.module.css';

export default function AreaFullPage() {
    const [allAreas, setAllAreas] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Filter State
    const [filterProvince, setFilterProvince] = useState("");
    const [filterDistrict, setFilterDistrict] = useState("");
    const [hideZeroScore, setHideZeroScore] = useState(false);

    useEffect(() => {
        // Fetch data on mount (limit 7)
        async function fetchData() {
            const data = await getElectionData(7);
            if (data && data.length > 0) {
                setAllAreas(data);
            }
        }
        fetchData();

        // Realtime Updates for Candidates
        pb.collection('candidates').subscribe('*', function (e) {
            if (e.action === 'update') {
                setAllAreas(prevAreas => {
                    return prevAreas.map(area => {
                        if (area.id !== e.record.area) return area;

                        // Update Candidate Score
                        const updatedCandidates = area.candidates.map(c => {
                            if (c.id === e.record.id) {
                                return { ...c, score: e.record.totalVotes };
                            }
                            return c;
                        });

                        // Re-sort and Re-rank
                        updatedCandidates.sort((a, b) => b.score - a.score);
                        const reRankedCandidates = updatedCandidates.map((c, index) => ({
                            ...c,
                            rank: index + 1
                        }));

                        return { ...area, candidates: reRankedCandidates };
                    });
                });
            }
        });

        // Realtime Subscription: Settings (Filter)
        pb.collection('settings').subscribe('*', function (e) {
            if (e.action === 'update' || e.action === 'create') {
                setFilterProvince(e.record.filter_province || "");
                setFilterDistrict(e.record.filter_district || "");
                setHideZeroScore(e.record.hide_zero_score || false);

                setCurrentIndex(0);
                setIsVisible(true);
            }
        });

        // Fetch initial settings
        getSettings().then(s => {
            if (s) {
                setFilterProvince(s.filter_province || "");
                setFilterDistrict(s.filter_district || "");
                setHideZeroScore(s.hide_zero_score || false);
            }
        });

        return () => {
            pb.collection('candidates').unsubscribe('*');
            pb.collection('settings').unsubscribe('*');
        };
    }, []);

    const filteredAreas = useMemo(() => {
        let result = allAreas.map(area => ({ ...area, candidates: [...area.candidates] }));

        if (filterProvince) result = result.filter(area => area._provinceName === filterProvince);
        if (filterDistrict) result = result.filter(area => String(area._zoneNumber) === String(filterDistrict));

        if (hideZeroScore) {
            result = result.map(area => {
                const filteredCandidates = area.candidates.filter(c => Number(c.score) > 0);
                return { ...area, candidates: filteredCandidates };
            });
            result = result.filter(area => area.candidates.length > 0);
        }

        return result;
    }, [allAreas, filterProvince, filterDistrict, hideZeroScore]);

    useEffect(() => {
        if (filteredAreas.length <= 1) return;
        const loopInterval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % filteredAreas.length);
                setIsVisible(true);
            }, 500);
        }, 5000);
        return () => clearInterval(loopInterval);
    }, [filteredAreas]);

    const validIndex = filteredAreas.length > 0 ? currentIndex % filteredAreas.length : 0;
    const currentArea = filteredAreas.length > 0 ? filteredAreas[validIndex] : null;

    if (!currentArea) {
        return (
            <div className={`${styles.container} ${styles.studioBackground}`}>
                <div style={{ color: 'white', textAlign: 'center', paddingTop: '40vh', fontSize: '2rem' }}>
                    {allAreas.length === 0 ? "Loading Data..." : "Waiting for Filter Selection..."}
                </div>
            </div>
        );
    }

    const rank1Candidate = currentArea.candidates[0];
    const otherCandidates = currentArea.candidates.slice(1, 7);

    return (
        <div className={`${styles.container} ${styles.studioBackground}`}>
            <div style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                width: '100%',
                height: '100%'
            }}>
                {/* Header */}
                <div className={styles.headerArea} key={currentArea.id}>
                    <div className={`${styles.province} ${styles.animFadeUp}`} style={{ animationDelay: '0.1s' }}>{currentArea._provinceName}</div>
                    <div className={`${styles.zone} ${styles.animFadeUp}`} style={{ animationDelay: '0.3s' }}>เขต {currentArea._zoneNumber}</div>
                </div>

                {/* Rank 1 */}
                <div className={styles.rank1Area}>
                    {rank1Candidate && (
                        <ScoreCard key={rank1Candidate.id} {...rank1Candidate} rankPosition="bottom" />
                    )}
                </div>

                {/* Grid (Ranks 2-7) */}
                <div className={styles.gridArea}>
                    {otherCandidates.map(c => (
                        <div key={c.id} className={styles.gridItem}>
                            <ScoreCard {...c} rankPosition="bottom" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
