"use client";

import { useState, useEffect, useRef } from 'react';
import { getPartyListData, getTotalVotes } from '@/services/electionService';
import CountUp from 'react-countup';
import styles from './page.module.css';

function PartySeatCard({ party, index, rank }) {
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
                backgroundSize: 'contain' // ScoreCard uses bgUrl? 'url("...")' : 'none' usually.
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
    const [totalVotes, setTotalVotes] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchData = async () => {
        const [partiesData, votesData] = await Promise.all([
            getPartyListData('-constituencySeats'),
            getTotalVotes()
        ]);

        // Filter parties with >0 seats
        setParties(partiesData.filter(p => p.constituencySeats > 0));
        setTotalVotes(votesData.constituencyTotal);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Loop Effect
    useEffect(() => {
        if (parties.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.ceil(parties.length / 7);
                return (prev + 1) % maxIndex;
            });
        }, 10000); // 10 seconds per page

        return () => clearInterval(interval);
    }, [parties.length]);

    const visibleParties = parties.slice(currentIndex * 7, (currentIndex + 1) * 7);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>คะแนน ส.ส.แบ่งเขต</div>
                <div className={styles.headerSubtitle}>
                    นับแล้ว <CountUp end={totalVotes} separator="," duration={1} />
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
