
"use client";

import { useState, useEffect } from 'react';
import ReferendumBar from '@/components/ReferendumBar/ReferendumBar';
import { getReferendumData } from '@/services/electionService';
import pb from '@/lib/pocketbase';
import styles from './page.module.css';

export default function ReferendumPage() {
    const [data, setData] = useState({
        approve: 0,
        disapprove: 0,
        no_vote: 0,
        bad_cards: 0,
        total_counted: 0,
        title: ""
    });

    const fetchData = async () => {
        const result = await getReferendumData();
        if (result) {
            setData(result);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscription
        // Assuming 'referendum' collection exists
        try {
            pb.collection('referendum').subscribe('*', function (e) {
                console.log("Referendum Update:", e.action);
                if (e.action === 'update' || e.action === 'create') {
                    setData({
                        approve: e.record.agreeTotalVotes || 0,
                        disapprove: e.record.disagreeTotalVotes || 0,
                        no_vote: e.record.noVotes || 0,
                        bad_cards: e.record.invalidVotes || 0,
                        total_counted: e.record.totalVotes || 0,
                        title: e.record.title || ""
                    });
                }
            }).catch(err => console.warn("Referendum sub failed (likely collection missing):", err));
        } catch (err) {
            console.warn("Sub setup error:", err);
        }

        return () => {
            try {
                pb.collection('referendum').unsubscribe('*');
            } catch (e) { }
        };
    }, []);

    return (
        <div className={styles.container}>
            {/* Watermark for Camera Feed alignment */}
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

            {/* Title (Optional) */}
            {data.title && (
                <div className={styles.titleArea}>
                    {data.title}
                </div>
            )}

            <div className={styles.contentArea}>
                <ReferendumBar
                    approve={data.approve}
                    disapprove={data.disapprove}
                    noVote={data.no_vote}
                    badCards={data.bad_cards}
                    totalCounted={data.total_counted}
                    title={data.title}
                />
            </div>
        </div>
    );
}
