
"use client";

import { useState, useEffect } from 'react';
import ReferendumBar from '@/components/ReferendumBar/ReferendumBar';
import { getReferendumData } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
import pb from '@/lib/pocketbase';
import styles from './page.module.css';

export default function ReferendumPage() {
    const [data, setData] = useState({
        approve: 0,
        disapprove: 0,
        approvePercent: 0,
        disagreePercent: 0,
        no_vote: 0,
        bad_cards: 0,
        total_counted: 0,
        title: ""
    });
    // const [removeBackground, setRemoveBackground] = useState(false); // Removed
    const [countDisplayMode, setCountDisplayMode] = useState('votes');

    const fetchData = async () => {
        const result = await getReferendumData();
        if (result) {
            setData(result);
        }

        try {
            const s = await getSettings();
            if (s) {
                setRemoveBackground(s.remove_background || false);
                setCountDisplayMode(s.count_display_mode || 'votes');
            }
        } catch (err) {
            console.warn("Could not fetch settings:", err);
        }
    };

    useEffect(() => {
        fetchData();

        // Realtime Subscription: Referendum
        try {
            pb.collection('referendum').subscribe('*', function (e) {
                // console.log("Referendum Update:", e.action);
                if (e.action === 'update' || e.action === 'create') {
                    setData({
                        approve: e.record.agreeTotalVotes || 0,
                        disapprove: e.record.disagreeTotalVotes || 0,
                        approvePercent: e.record.agreePercentage || 0,
                        disagreePercent: e.record.disagreePercentage || 0,
                        no_vote: e.record.noVotes || 0,
                        bad_cards: e.record.invalidVotes || 0,
                        total_counted: e.record.totalVotes || 0,
                        totalPercent: e.record.percent || e.record.percentage || 0,
                        title: e.record.title || ""
                    });
                }
            }).catch(err => console.warn("Referendum sub failed (likely collection missing):", err));
        } catch (err) {
            console.warn("Sub setup error:", err);
        }

        // Realtime Subscription: Settings
        try {
            pb.collection('settings').subscribe('*', function (e) {
                if (e.action === 'update' || e.action === 'create') {
                    setRemoveBackground(e.record.remove_background || false);
                    setCountDisplayMode(e.record.count_display_mode || 'votes');
                }
            }).catch(err => console.warn("Settings sub failed:", err));
        } catch (err) {
            console.warn("Settings sub setup error:", err);
        }

        return () => {
            try {
                pb.collection('referendum').unsubscribe('*');
                pb.collection('settings').unsubscribe('*');
            } catch (e) { }
        };
    }, []);

    const isPercent = countDisplayMode === 'percent';

    return (
        <div className={`${styles.container} ${styles.transparentBg}`}>
            {/* Title (Optional) */}
            {data.title && (
                <div className={styles.titleArea}>
                    {data.title}
                </div>
            )}

            <div className={styles.contentArea}>
                <ReferendumBar
                    approve={isPercent ? data.approvePercent : data.approve}
                    disapprove={isPercent ? data.disagreePercent : data.disapprove}
                    noVote={data.no_vote}
                    badCards={data.bad_cards}
                    totalCounted={isPercent ? data.totalPercent : data.total_counted}
                    title={data.title}
                    isPercent={isPercent}
                />
            </div>
        </div>
    );
}
