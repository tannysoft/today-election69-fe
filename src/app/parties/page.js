"use client";

import { useState, useEffect } from 'react';
import PartiesRightSidebar from '@/components/PartiesRightSidebar/PartiesRightSidebar';
import { getPartyListData } from '@/services/electionService';
import pb from '@/lib/pocketbase';
import styles from './page.module.css';

export default function PartiesPage() {
    const [parties, setParties] = useState([]);

    const fetchData = async () => {
        const data = await getPartyListData();
        // Map count (totalSeats) to score for the sidebar
        const mappedData = data.map(p => ({
            ...p,
            score: p.count // Use totalSeats as score
        }));
        setParties(mappedData);
    };

    useEffect(() => {
        fetchData();

        // Subscribe to parties updates
        pb.collection('parties').subscribe('*', function (e) {
            console.log("parties update:", e.action);
            fetchData();
        });

        return () => {
            pb.collection('parties').unsubscribe('*');
        };
    }, []);

    return (
        <div className={`${styles.container} ${styles.studioBackground}`}>
            <div className={`camera-feed-watermark ${styles.watermark}`}>
                1920x1080 CAMERA FEED TARGET
            </div>

            <div className={styles.sidebarArea}>
                <PartiesRightSidebar parties={parties} />
            </div>
        </div>
    );
}
