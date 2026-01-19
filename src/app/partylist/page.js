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

        // Subscribe to partylistResults updates
        pb.collection('partylistResults').subscribe('*', function (e) {
            console.log("partylistResults update:", e.action);
            fetchData();
        });

        return () => {
            pb.collection('partylistResults').unsubscribe('*');
        };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.leftTarget}>
                1920x1080 CAMERA FEED TARGET
            </div>

            <div className={styles.sidebarArea}>
                <PartyListSidebar parties={parties} />
            </div>
        </div>
    );
}
