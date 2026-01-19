"use client";

import { useState, useEffect } from 'react';
import LowerThird from '@/components/LowerThird/LowerThird';
import { getElectionData } from '@/services/electionService';
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
                // Fallback mock data if API fails or is empty, just to show something
                // Or we can leave it empty
                console.warn("No data fetched");
            }
        }
        fetchData();

        // Optional: Polling for new data every minute
        const dataInterval = setInterval(fetchData, 60000);
        return () => clearInterval(dataInterval);
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
