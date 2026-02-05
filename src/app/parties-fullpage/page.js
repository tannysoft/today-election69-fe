"use client";

import { useState, useEffect, useRef } from 'react';
import { getPartyListData } from '@/services/electionService';
import CountUp from 'react-countup';
import styles from './page.module.css';

// Sub-component for individual party row
function PartyRow({ party, index, rank }) {
    const nameRef = useRef(null);
    const containerRef = useRef(null);

    const checkScale = () => {
        if (nameRef.current && containerRef.current) {
            const parentWidth = containerRef.current.clientWidth;
            const textWidth = nameRef.current.scrollWidth;

            if (textWidth > parentWidth) {
                const scale = parentWidth / textWidth;
                nameRef.current.style.transform = `scaleX(${scale})`;
                nameRef.current.style.transformOrigin = 'right center';
                nameRef.current.style.width = `${textWidth}px`;
            } else {
                nameRef.current.style.transform = 'none';
                nameRef.current.style.width = 'auto';
            }
        }
    };

    useEffect(() => {
        checkScale();
        const timers = [
            setTimeout(checkScale, 50),
            setTimeout(checkScale, 500)
        ];
        if (document.fonts) {
            document.fonts.ready.then(checkScale);
        }
        return () => timers.forEach(clearTimeout);
    }, [party.name]);

    return (
        <div
            className={`${styles.partyRow} ${styles.slideIn}`}
            style={{ animationDelay: `${index * 0.05}s` }} /* Faster stagger for 10 items */
        >
            {/* Rank Badge */}
            <div className={styles.rankCircle}>{rank}</div>

            <div
                className={styles.rowBackground}
                style={{
                    backgroundImage: `url('/parties/fullpage/${party.name}.svg')`,
                }}
            />

            <div
                className={styles.pmImageContainer}
                style={party.name === 'พรรคเพื่อไทย' ? { left: '100px' } : {}}
            >
                <img
                    src={`/pm-candidates-group/${party.name}.png`}
                    alt="PM Candidates"
                    className={styles.pmImage}
                    style={party.name === 'พรรคเพื่อไทย' ? { height: '95%' } : {}}
                    onError={(e) => e.target.style.display = 'none'}
                />
            </div>

            <div className={styles.cardContent}>
                {/* Party Name */}
                <div className={styles.nameWrapper} ref={containerRef}>
                    <div className={styles.partyName} ref={nameRef}>
                        {party.name}
                    </div>
                </div>

                {/* Stats Row */}
                <div className={styles.mainStatsRow}>
                    {party.logoUrl && (
                        <div className={styles.logoContainer}>
                            <img src={party.logoUrl} alt={party.name} />
                        </div>
                    )}
                    <div className={styles.totalNumber}>
                        <CountUp end={party.count} duration={1} />
                    </div>
                    <div className={styles.totalLabel}>ที่นั่ง</div>
                </div>
            </div>

            <div className={styles.breakdownContainer}>
                <div className={styles.breakdownRow}>
                    <span className={styles.bdLabel}>บัญชีรายชื่อ</span>
                    <span className={styles.bdValue}>
                        <CountUp end={party.partyListSeats} duration={1} />
                    </span>
                </div>
                <div className={styles.breakdownRow}>
                    <span className={styles.bdLabel}>แบ่งเขต</span>
                    <span className={styles.bdValue}>
                        <CountUp end={party.constituencySeats} duration={1} />
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function PartiesFullPage() {
    const [parties, setParties] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchData = async () => {
        const data = await getPartyListData();
        setParties(data.filter(p => p.count > 0)); // Fetch all valid
    };

    useEffect(() => {
        fetchData();
        // Polling if needed
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Loop Effect
    useEffect(() => {
        if (parties.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.ceil(parties.length / 10);
                return (prev + 1) % maxIndex;
            });
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [parties.length]);

    // Provide some totals for footer if needed (mock or calculate)
    const totalPartyList = parties.reduce((acc, p) => acc + (p.partyListSeats || 0), 0);
    const totalConstituency = parties.reduce((acc, p) => acc + (p.constituencySeats || 0), 0);

    const visibleParties = parties.slice(currentIndex * 10, (currentIndex + 1) * 10);

    return (
        <div className={styles.container}>
            <div className={styles.header}>รวมจำนวน สส.</div>

            <div className={styles.gridContainer} key={currentIndex}>
                {visibleParties.map((party, index) => (
                    <PartyRow
                        key={party.name}
                        party={party}
                        index={index}
                        rank={(currentIndex * 10) + index + 1}
                    />
                ))}
            </div>

            <div className={styles.footer}>
                นับแล้ว {totalPartyList.toLocaleString()}
            </div>
        </div>
    );
}
