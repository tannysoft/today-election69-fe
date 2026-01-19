"use client";

import { useState, useEffect } from 'react';
import LowerThird from '@/components/LowerThird/LowerThird';
import { getElectionData } from '@/services/electionService';
import pb from '@/lib/pocketbase';
import styles from './page.module.css';

export default function AreaPage() {
    const [areas, setAreas] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Fetch data on mount
        async function fetchData() {
            const data = await getElectionData();
            if (data && data.length > 0) {
                setAreas(data);
            } else {
                console.warn("No data fetched");
            }
        }
        fetchData();

        // Realtime Subscription
        pb.collection('candidates').subscribe('*', function (e) {
            console.log("Realtime update:", e.action, e.record);

            if (e.action === 'update') {
                setAreas(prevAreas => {
                    return prevAreas.map(area => {
                        // Check if the updated candidate is in this area
                        // We don't have area ID easily available in the candidate record from the event event directly if it's not expanded,
                        // but we can check if the candidate exists in our current state.

                        // Actually, e.record has 'area' field (relation id).
                        if (area.id !== e.record.area) {
                            return area;
                        }

                        // Update the specific candidate
                        const updatedCandidates = area.candidates.map(c => {
                            if (c.id === e.record.id) {
                                return {
                                    ...c,
                                    score: e.record.totalVotes
                                };
                            }
                            return c;
                        });

                        // Re-sort candidates by score (descending)
                        updatedCandidates.sort((a, b) => b.score - a.score);

                        // Re-assign ranks
                        const reRankedCandidates = updatedCandidates.map((c, index) => ({
                            ...c,
                            rank: index + 1
                        }));

                        return {
                            ...area,
                            candidates: reRankedCandidates
                        };
                    });
                });
            }
        });

        return () => {
            pb.collection('candidates').unsubscribe('*');
        };
    }, []);

    useEffect(() => {
        if (areas.length <= 1) return;

        const loopInterval = setInterval(() => {
            // Fade out
            setIsVisible(false);

            setTimeout(() => {
                // Change index after fade out
                setCurrentIndex((prev) => (prev + 1) % areas.length);
                // Fade in
                setIsVisible(true);
            }, 500); // Wait for fade out animation (500ms)

        }, 5000); // 5 seconds per area

        return () => clearInterval(loopInterval);
    }, [areas]);

    const currentArea = areas[currentIndex];

    if (!currentArea && areas.length === 0) {
        return (
            <div className={`${styles.container} ${styles.studioBackground}`}>
                <div style={{ color: 'white', textAlign: 'center', paddingTop: '20vh' }}>
                    Loading Election Data...
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${styles.studioBackground}`}>
            <div style={{
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
