"use client";

import { useState, useEffect, useMemo } from 'react';
import LowerThird from '@/components/LowerThird/LowerThird';
import { getElectionData } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
import pb from '@/lib/pocketbase';
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

    useEffect(() => {
        // Fetch data on mount
        async function fetchData() {
            const data = await getElectionData();
            if (data && data.length > 0) {
                setAllAreas(data);
            } else {
                console.warn("No data fetched");
            }

            // Fetch initial settings via Server Action
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
        fetchData();

        // Realtime Subscription: Candidates
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
        try {
            pb.collection('settings').subscribe('*', function (e) {
                console.log("Settings Update:", e.action, e.record);
                if (e.action === 'update' || e.action === 'create') {
                    setFilterProvince(e.record.filter_province || "");
                    setFilterDistrict(e.record.filter_district || "");
                    setHideZeroScore(e.record.hide_zero_score || false);

                    // Reset index on filter change to allow smooth transition to new set
                    setCurrentIndex(0);
                    setIsVisible(true);
                }
            }).catch(err => {
                console.warn("Subscription to settings failed:", err);
            });
        } catch (err) {
            console.warn("Subscription setup error:", err);
        }

        return () => {
            pb.collection('candidates').unsubscribe('*');
            pb.collection('settings').unsubscribe('*');
        };
    }, []);

    // Derived State: filteredAreas (Instant update, no useEffect delay)
    const filteredAreas = useMemo(() => {
        let result = allAreas.map(area => {
            // Create a deep(ish) copy or at least shallow copy of candidates to not mutate original
            return { ...area, candidates: [...area.candidates] };
        });

        // 1. Filter by Province
        if (filterProvince) {
            result = result.filter(area => area._provinceName === filterProvince);
        }

        // 2. Filter by District
        if (filterDistrict) {
            result = result.filter(area => String(area._zoneNumber) === String(filterDistrict));
        }

        // 3. Hide Zero Score - Candidate Level
        if (hideZeroScore) {
            console.log("Filtering Zero Scores...");
            result = result.map(area => {
                const filteredCandidates = area.candidates.filter(c => {
                    const keep = Number(c.score) > 0;
                    if (!keep) {
                        // console.log(`Dropping candidate ${c.name} with score ${c.score}`);
                    }
                    return keep;
                });
                return { ...area, candidates: filteredCandidates };
            });

            // 4. Hide Area if No Candidates Left
            result = result.filter(area => {
                if (area.candidates.length === 0) {
                    console.log(`Hiding Area ${area.name} because no candidates left.`);
                    return false;
                }
                return true;
            });
        } else {
            console.log("Hide Zero Score is OFF");
        }

        return result;
    }, [allAreas, filterProvince, filterDistrict, hideZeroScore]);


    // Cycling Logic
    useEffect(() => {
        if (filteredAreas.length <= 1) return;

        const loopInterval = setInterval(() => {
            // Fade out
            setIsVisible(false);

            setTimeout(() => {
                // Change index after fade out
                setCurrentIndex((prev) => (prev + 1) % filteredAreas.length);
                // Fade in
                setIsVisible(true);
            }, 500); // Wait for fade out animation (500ms)

        }, 5000); // 5 seconds per area

        return () => clearInterval(loopInterval);
    }, [filteredAreas]); // Re-run when filtered list changes

    // Safe access
    // Guard against index out of bounds if list shrinks
    const validIndex = filteredAreas.length > 0 ? currentIndex % filteredAreas.length : 0;
    const currentArea = filteredAreas.length > 0 ? filteredAreas[validIndex] : null;

    if (!currentArea && filteredAreas.length === 0) {
        // Show a different message if filtered out completely vs loading
        const isLoading = allAreas.length === 0;

        return (
            <div className={`${styles.container} ${styles.studioBackground}`}>
                <div style={{ color: 'white', textAlign: 'center', paddingTop: '20vh' }}>
                    {isLoading ? "Loading Election Data..." : "Waiting for Filter Selection..."}
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${styles.studioBackground}`}>
            <div className="camera-feed-watermark" style={{
                position: 'absolute',
                top: '200px',
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.1)',
                fontSize: '3rem',
                fontWeight: 700
            }}>
                1920 x 1080 CAMERA FEED
            </div>

            <div style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
                width: '100%',
                height: '100%'
            }}>
                <LowerThird
                    areaName={currentArea?.name}
                    candidates={currentArea?.candidates}
                />
            </div>
        </div>
    );
}
