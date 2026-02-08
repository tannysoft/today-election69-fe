"use client";

import { useState, useEffect, useMemo } from 'react';
import ScoreCard from '@/components/LowerThird/ScoreCard';
import { getElectionData } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
// import pb from '@/lib/pocketbase'; // Removed
import { BANGKOK_ZONES } from '@/data/bangkokZones';
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
        // Fetch data on mount and interval
        async function fetchElectionData() {
            const data = await getElectionData(5); // Keep limit 5 from original
            if (data && data.length > 0) {
                setAllAreas(data);
            }
        }

        async function fetchSettingsData() {
            // Fetch settings
            try {
                const s = await getSettings();
                if (s) {
                    setFilterProvince(s.filter_province || "");
                    setFilterDistrict(s.filter_district || "");
                    setHideZeroScore(s.hide_zero_score || false);
                }
            } catch (err) {
                console.warn("Could not fetch settings:", err);
            }
        }

        // Initial Fetch
        fetchElectionData();
        fetchSettingsData();

        // Intervals
        const dataInterval = setInterval(fetchElectionData, 30000); // 30 seconds for data
        const settingsInterval = setInterval(fetchSettingsData, 3000); // 3 seconds for settings

        return () => {
            clearInterval(dataInterval);
            clearInterval(settingsInterval);
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
        }, 10000);
        return () => clearInterval(loopInterval);
    }, [filteredAreas]);

    const validIndex = filteredAreas.length > 0 ? currentIndex % filteredAreas.length : 0;
    const currentArea = filteredAreas.length > 0 ? filteredAreas[validIndex] : null;

    if (!currentArea) {
        return (
            <div className={styles.container}>
                <div style={{ color: 'white', textAlign: 'center', paddingTop: '40vh', fontSize: '2rem' }}>
                    {allAreas.length === 0 ? "Loading Data..." : "Waiting for Filter Selection..."}
                </div>
            </div>
        );
    }

    const rank1Candidate = currentArea.candidates[0];
    const otherCandidates = currentArea.candidates.slice(1, 5);

    return (
        <div className={styles.container}>
            <div style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                width: '100%',
                height: '100%'
            }}>
                {/* Header: Top Left */}
                <div className={styles.headerArea} key={currentArea.id}>
                    <div className={styles.provinceZoneRow}>
                        <div className={`${styles.province} ${styles.animFadeInRight}`} style={{ animationDelay: '0.1s' }}>{currentArea._provinceName}</div>
                        <div className={`${styles.zonePill} ${styles.animFadeInRight}`} style={{ animationDelay: '0.3s' }}>
                            <span>เขต {currentArea._zoneNumber}</span>
                        </div>
                    </div>
                    {/* Display Bangkok District Name if applicable */}
                    {(currentArea._provinceName === 'กรุงเทพมหานคร' || currentArea._provinceName === 'Bangkok') && (
                        <div className={`${styles.zoneDescription} ${styles.animFadeInRight}`} style={{ animationDelay: '0.5s' }}>
                            {BANGKOK_ZONES[Number(currentArea._zoneNumber)]}
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className={styles.contentArea}>
                    {/* Rank 1 - Centered Top */}
                    <div className={styles.rank1Area}>
                        {rank1Candidate && (
                            <ScoreCard key={rank1Candidate.id} {...rank1Candidate} />
                        )}
                    </div>

                    {/* Grid (Ranks 2-5) - 2 Columns */}
                    <div className={styles.gridArea}>
                        {otherCandidates.map(c => (
                            <div key={c.id} className={styles.gridItem}>
                                <ScoreCard {...c} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
