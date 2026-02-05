"use client";

import { useState, useEffect, useRef } from 'react';
import { getPartyListData, getNationalTotal } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
import pb from '@/lib/pocketbase';
import CountUp from 'react-countup';
import styles from './page.module.css';

function PartySeatCard({ party, index, rank }) {
    // ... (unchanged)
    const [bgUrl, setBgUrl] = useState(null);

    // Load background SVG logic copied from ScoreCard
    useEffect(() => {
        if (!party.name) {
            setBgUrl(null);
            return;
        }
        const targetUrl = `/parties/lowerthird/${party.name}.svg`;
        const img = new Image();
        img.src = targetUrl;
        img.onload = () => setBgUrl(targetUrl);
        img.onerror = () => setBgUrl('/parties/lowerthird/default.svg'); // Fallback or null
    }, [party.name]);

    return (
        <div
            className={`${styles.card} ${styles.slideIn}`}
            style={{
                animationDelay: `${index * 0.1}s`,
                backgroundImage: bgUrl ? `url("${bgUrl}")` : 'none',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain'
            }}
        >
            {/* Rank - Position adjusted in CSS to match visual */}
            <div className={styles.rankCircle}>{rank}</div>

            {/* Logo Circle */}
            <div className={styles.portraitCircle}>
                {party.logoUrl && (
                    <img
                        src={party.logoUrl}
                        alt={party.name}
                        className={styles.partyLogo}
                    />
                )}
            </div>

            <div className={styles.cardInner}>

                {/* Top Row: Party Name */}
                <div
                    className={styles.topRow}
                    style={{ background: bgUrl ? 'transparent' : '#222' }}
                >
                    <div className={styles.infoContent}>
                        <div className={styles.name}>{party.name}</div>
                    </div>
                </div>

                {/* Bottom Row: Score (Seats) */}
                <div
                    className={styles.bottomRow}
                    style={{
                        backgroundColor: bgUrl ? 'transparent' : (party.color || '#ff6600')
                    }}
                >
                    <div className={styles.scoreContent}>
                        <span className={styles.scoreMain}>
                            <CountUp end={party.constituencySeats} duration={1} />
                        </span>
                        <span className={styles.scoreLabelSuffix}>ที่นั่ง</span>
                    </div>
                    {/* No Label Tab here as per request */}
                </div>
            </div>
        </div>
    );
}

export default function PartiesSeatsPage() {
    const [parties, setParties] = useState([]);
    const [countedData, setCountedData] = useState({ totalVotes: 0, percent: 0 });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState('auto'); // auto, manual
    const [manualIndex, setManualIndex] = useState(0);
    const [countDisplayMode, setCountDisplayMode] = useState('votes');

    const fetchData = async () => {
        const [partiesData, nationalData] = await Promise.all([
            getPartyListData('-constituencySeats'),
            getNationalTotal()
        ]);

        // Filter parties with >0 seats
        setParties(partiesData.filter(p => p.constituencySeats > 0));
        setCountedData({
            totalVotes: nationalData.totalVotes,
            percent: nationalData.percent
        });
    };

    useEffect(() => {
        fetchData();

        // Fetch initial settings
        getSettings().then(settings => {
            if (settings) {
                const mode = settings.party_seats_mode || 'auto';
                const idx = Number(settings.party_seats_index) || 0;
                const cMode = settings.count_display_mode || 'votes';

                setViewMode(mode);
                setManualIndex(idx);
                setCountDisplayMode(cMode);

                if (mode === 'manual') setCurrentIndex(idx);
            }
        });

        // Realtime Settings Subscription
        const subSettings = pb.collection('settings').subscribe('*', (e) => {
            if (e.action === 'update' || e.action === 'create') {
                const s = e.record;
                const newMode = s.party_seats_mode || 'auto';
                const newIndex = Number(s.party_seats_index) || 0;
                const newCountMode = s.count_display_mode || 'votes';

                setViewMode(newMode);
                setManualIndex(newIndex);
                setCountDisplayMode(newCountMode);

                if (newMode === 'manual') {
                    setCurrentIndex(newIndex);
                }
            }
        });

        // Realtime National Subscription
        const subNational = pb.collection('national').subscribe('*', async () => {
            const data = await getNationalTotal();
            setCountedData({
                totalVotes: data.totalVotes,
                percent: data.percent
            });
        });

        const interval = setInterval(fetchData, 10000);
        return () => {
            clearInterval(interval);
            subSettings.then(unsubscribe => unsubscribe && unsubscribe());
            subNational.then(unsubscribe => unsubscribe && unsubscribe());
            pb.collection('settings').unsubscribe('*');
            pb.collection('national').unsubscribe('*');
        };
    }, []);

    // Loop Effect
    useEffect(() => {
        if (parties.length === 0) return;

        // Manual Mode
        if (viewMode === 'manual') {
            setCurrentIndex(manualIndex);
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.ceil(parties.length / 7);
                return (prev + 1) % maxIndex;
            });
        }, 10000); // 10 seconds per page

        return () => clearInterval(interval);
    }, [parties.length, viewMode, manualIndex]);

    const visibleParties = parties.slice(currentIndex * 7, (currentIndex + 1) * 7);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>คะแนน สส.แบ่งเขต</div>
                <div className={styles.headerSubtitle}>
                    นับแล้ว
                    <span style={{ marginLeft: '10px' }}>
                        {countDisplayMode === 'votes' ? (
                            <CountUp end={countedData.totalVotes} separator="," duration={1} />
                        ) : (
                            <><CountUp end={countedData.percent} decimals={2} duration={1} />%</>
                        )}
                    </span>
                </div>
            </div>

            <div className={styles.listContainer} key={currentIndex}>
                {visibleParties.map((party, index) => (
                    <PartySeatCard
                        key={party.name}
                        party={party}
                        index={index}
                        rank={(currentIndex * 7) + index + 1}
                    />
                ))}
            </div>
        </div>
    );
}
