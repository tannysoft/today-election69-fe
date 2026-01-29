"use client";

import { useState, useEffect, useMemo } from 'react';
import LowerThird from '@/components/LowerThird/LowerThird';
import { getElectionData, getCandidatesForArea } from '@/services/electionService';
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
        pb.collection('candidates').subscribe('*', async function (e) {
            if (e.action === 'update') {
                // Fetch the latest sorted candidates for this area from the server
                // This ensures we rely on the DB for sorting
                const updatedCandidates = await getCandidatesForArea(e.record.area);

                setAllAreas(prevAreas => {
                    return prevAreas.map(area => {
                        if (area.id !== e.record.area) return area;
                        // Replace candidates with the fresh sorted list from DB
                        return { ...area, candidates: updatedCandidates };
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


    const [isExiting, setIsExiting] = useState(false);

    // Cycling Logic
    useEffect(() => {
        if (filteredAreas.length <= 1) return;

        const loopInterval = setInterval(() => {
            // 1. Start Exit Animation
            setIsExiting(true);

            // 2. Wait for animation to finish, then switch data
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % filteredAreas.length);
                setIsExiting(false);
            }, 500); // 0.5s duration to match CSS

        }, 10000); // 10 seconds per area (including transition)

        return () => clearInterval(loopInterval);
    }, [filteredAreas]);

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
