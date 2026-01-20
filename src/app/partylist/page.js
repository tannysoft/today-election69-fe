"use client";

import { useState, useEffect } from 'react';
import PartyListSidebar from '@/components/PartyListSidebar/PartyListSidebar';
import { getPartyListData } from '@/services/electionService';
import pb from '@/lib/pocketbase';
import styles from './page.module.css';

export default function PartyListPage() {
    const [parties, setParties] = useState([]);

    const fetchData = async () => {
        const data = await getPartyListData();
        setParties(data);
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
        <div className={styles.container}>
            <div className={`${styles.leftTarget} camera-feed-watermark`}>
                1920x1080 CAMERA FEED TARGET
            </div>

            <div className={styles.sidebarArea}>
                <PartyListSidebar parties={parties} />
            </div>
        </div>
    );
}
