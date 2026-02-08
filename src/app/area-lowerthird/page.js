"use client";

import { useState, useEffect, useMemo } from 'react';
import LowerThird from '@/components/LowerThird/LowerThird';
import { getElectionData } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
// import pb from '@/lib/pocketbase'; // Removed
import styles from './page.module.css';

export default function AreaPage() {
    const [allAreas, setAllAreas] = useState([]); // Store ALL loaded areas
    // const [filteredAreas, setFilteredAreas] = useState([]); // REMOVED: derived state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Filter State
    const [filterProvince, setFilterProvince] = useState("");
    const [filterDistrict, setFilterDistrict] = useState("");
    const [hideZeroScore, setHideZeroScore] = useState(false);
    // const [removeBackground, setRemoveBackground] = useState(false); // Removed

    useEffect(() => {
        // Fetch data on mount and interval
        async function fetchElectionData() {
            const data = await getElectionData();
            if (data && data.length > 0) {
                setAllAreas(data);
            } else {
                console.warn("No data fetched");
            }
        }

        async function fetchSettingsData() {
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

    // ... (Memoized filteredAreas logic remains same)
    const filteredAreas = useMemo(() => {
        let result = allAreas.map(area => {
            return { ...area, candidates: [...area.candidates] };
        });

        if (filterProvince) {
            result = result.filter(area => area._provinceName === filterProvince);
        }

        if (filterDistrict) {
            result = result.filter(area => String(area._zoneNumber) === String(filterDistrict));
        }

        if (hideZeroScore) {
            // ... (hide zero score logic)
            result = result.map(area => {
                const filteredCandidates = area.candidates.filter(c => Number(c.score) > 0);
                return { ...area, candidates: filteredCandidates };
            });

            result = result.filter(area => area.candidates.length > 0);
        }

        return result;
    }, [allAreas, filterProvince, filterDistrict, hideZeroScore]);

    // ... (Cycling logic remains same)
    const [isExiting, setIsExiting] = useState(false);
    useEffect(() => {
        if (filteredAreas.length <= 1) return;
        const loopInterval = setInterval(() => {
            setIsExiting(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % filteredAreas.length);
                setIsExiting(false);
            }, 500);
        }, 10000);
        return () => clearInterval(loopInterval);
    }, [filteredAreas]);

    const validIndex = filteredAreas.length > 0 ? currentIndex % filteredAreas.length : 0;
    const currentArea = filteredAreas.length > 0 ? filteredAreas[validIndex] : null;

    if (!currentArea && filteredAreas.length === 0) {
        const isLoading = allAreas.length === 0;

        return (
            <div className={`${styles.container} ${styles.transparentBg}`}>
                <div style={{ color: 'white', textAlign: 'center', paddingTop: '20vh' }}>
                    {isLoading ? "Loading Election Data..." : "Waiting for Filter Selection..."}
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${styles.transparentBg}`}>
            <div style={{
                width: '100%',
                height: '100%'
            }}>
                <LowerThird
                    key={currentArea?.id}
                    areaName={currentArea?.name}
                    candidates={currentArea?.candidates}
                    isExiting={isExiting}
                />
            </div>
        </div>
    );
}
