"use client";

import { useState, useEffect, useRef } from 'react';
import { getPartyListData, getTotalVotes, getNationalPartylistTotal, getNationalTotal } from '@/services/electionService';
import { getSettings } from '@/services/settingsService';
import pb from '@/lib/pocketbase';
import CountUp from 'react-countup';
import styles from './page.module.css';

// Sub-component for individual party row to handle refs/scaling
function PartyRow({ party, index, rank }) {
    const nameRef = useRef(null);
    const containerRef = useRef(null);
    const [bgUrl, setBgUrl] = useState(null);

    const checkScale = () => {
        if (nameRef.current && containerRef.current) {
            const parentWidth = containerRef.current.clientWidth;
            const textWidth = nameRef.current.scrollWidth;

            if (textWidth > parentWidth) {
                const scale = parentWidth / textWidth;
                nameRef.current.style.transform = `scaleX(${scale})`;
                nameRef.current.style.transformOrigin = 'right center'; // Align right
                nameRef.current.style.width = `${textWidth}px`;
            } else {
                nameRef.current.style.transform = 'none';
                nameRef.current.style.width = 'auto';
            }
        }
    };

    // Whitelist of parties with custom background images
    const AVAILABLE_BG_PARTIES = [
        'พรรคกล้าธรรม',
        'พรรคประชาชน',
        'พรรคประชาธิปัตย์',
        'พรรคพลังประชารัฐ',
        'พรรคภูมิใจไทย',
        'พรรครวมไทยสร้างชาติ',
        'พรรคเพื่อไทย',
        'พรรคเศรษฐกิจ',
        'พรรคไทยก้าวใหม่',
        'พรรคไทยสร้างไทย'
    ];

    useEffect(() => {
        if (!party.name) {
            setBgUrl(null);
            return;
        }

        if (AVAILABLE_BG_PARTIES.includes(party.name)) {
            setBgUrl(`/parties/fullpage/${party.name}.svg`);
        } else {
            setBgUrl('/parties/fullpage/default.svg');
        }
    }, [party.name]);

    useEffect(() => {
        // Immediate check
        checkScale();

        // Re-check after small delays for font loading/layout settlement
        const timers = [
            setTimeout(checkScale, 50),
            setTimeout(checkScale, 500)
        ];

        // Also try to listen for font ready if supported
        if (document.fonts) {
            document.fonts.ready.then(checkScale);
        }

        return () => timers.forEach(clearTimeout);
    }, [party.name]);

    return (
        <div
            className={`${styles.partyRow} ${styles.slideIn}`}
            style={{ animationDelay: `${index * 0.15}s` }}
        >
            {/* Rank Badge */}
            <div className={styles.rankCircle}>{rank}</div>

            {/* Background SVG */}
            {/* ... */}
            <div
                className={styles.rowBackground}
                style={{
                    backgroundImage: bgUrl ? `url('${bgUrl}')` : 'none',
                }}
            />

            {/* PM Candidates Image (Single Group) */}
            {bgUrl && bgUrl !== '/parties/fullpage/default.svg' && (
                <div
                    className={styles.pmImageContainer}
                    style={party.name === 'พรรคเพื่อไทย' ? { left: '70px' } : {}}
                >
                    <img
                        src={`/pm-candidates-group/${party.name}.png`}
                        alt="PM Candidates"
                        className={styles.pmImage}
                        style={party.name === 'พรรคเพื่อไทย' ? { height: '95%' } : {}}
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}

            {/* Card Content Area */}
            <div className={styles.cardContent}>
                {/* Top Row: Party Name */}
                {/* Wrap in container for width limit */}
                <div className={styles.nameWrapper} ref={containerRef}>
                    <div className={styles.partyName} ref={nameRef} style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {party.name}
                    </div>
                </div>

                {/* Bottom Row: Logo + Score + Label */}
                <div className={styles.mainStatsRow}>
                    {/* Logo */}
                    {party.logoUrl && (
                        <div className={styles.logoContainer}>
                            <img src={party.logoUrl} alt={party.name} />
                        </div>
                    )}

                    {/* Total Score */}
                    <div className={styles.totalNumber}>
                        <CountUp end={party.count} duration={1} />
                    </div>
                    <div className={styles.totalLabel}>ที่นั่ง</div>
                </div>
            </div>

            {/* Breakdown Stats (Absolute Right) */}
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

export default function PartiesPage() {
    const [parties, setParties] = useState([]);
    const [totalVotes, setTotalVotes] = useState({ partyListTotal: 0, constituencyTotal: 0 });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewMode, setViewMode] = useState('auto'); // auto, manual
    const [manualIndex, setManualIndex] = useState(0);
    const [countDisplayMode, setCountDisplayMode] = useState('votes'); // votes, percent

    const fetchAllData = async () => {
        try {
            const [partiesData, nationalPartylistData, nationalConstituencyData] = await Promise.all([
                getPartyListData(),
                getNationalPartylistTotal(),
                getNationalTotal()
            ]);

            setParties(partiesData.filter(p => p.count > 0));
            // Store full objects now
            setTotalVotes({
                partyListTotal: nationalPartylistData.totalVotes,
                partyListPercent: nationalPartylistData.percent,
                constituencyTotal: nationalConstituencyData.totalVotes,
                constituencyPercent: nationalConstituencyData.percent
            });
        } catch (error) {
            console.error("Error fetching all data:", error);
        }
    };

    useEffect(() => {
        fetchAllData();

        // Fetch initial settings
        getSettings().then(settings => {
            if (settings) {
                const mode = settings.party_page_mode || 'auto';
                const idx = Number(settings.party_page_index) || 0;
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
                const newMode = s.party_page_mode || 'auto';
                const newIndex = Number(s.party_page_index) || 0;
                const newCountMode = s.count_display_mode || 'votes';

                setViewMode(newMode);
                setManualIndex(newIndex);
                setCountDisplayMode(newCountMode);

                // Immediate update for manual mode to skip effect delay
                if (newMode === 'manual') {
                    setCurrentIndex(newIndex);
                }
            }
        });

        // Realtime nationalPartylist Subscription
        const subNationalPartylist = pb.collection('nationalPartylist').subscribe('*', async () => {
            const data = await getNationalPartylistTotal();
            setTotalVotes(prev => ({
                ...prev,
                partyListTotal: data.totalVotes,
                partyListPercent: data.percent
            }));
        });

        // Realtime national (Constituency) Subscription
        const subNational = pb.collection('national').subscribe('*', async () => {
            const data = await getNationalTotal();
            setTotalVotes(prev => ({
                ...prev,
                constituencyTotal: data.totalVotes,
                constituencyPercent: data.percent
            }));
        });

        // Polling
        const interval = setInterval(fetchAllData, 60000);

        return () => {
            clearInterval(interval);
            subSettings.then(unsubscribe => unsubscribe && unsubscribe());
            subNationalPartylist.then(unsubscribe => unsubscribe && unsubscribe());
            subNational.then(unsubscribe => unsubscribe && unsubscribe());
            pb.collection('settings').unsubscribe('*');
            pb.collection('nationalPartylist').unsubscribe('*');
            pb.collection('national').unsubscribe('*');
        };
    }, []);

    // Loop Effect
    useEffect(() => {
        if (parties.length === 0) return;

        // Manual Mode: Force index
        if (viewMode === 'manual') {
            setCurrentIndex(manualIndex);
            return;
        }

        // Auto Mode: Loop
        const interval = setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = Math.ceil(parties.length / 5);
                return (prev + 1) % maxIndex;
            });
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [parties.length, viewMode, manualIndex]);

    const visibleParties = parties.slice(currentIndex * 5, (currentIndex + 1) * 5);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>รวมจำนวน สส.</div>
                <div className={styles.headerStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>เขต</span>
                        <span className={styles.statLabelSmall}>นับแล้ว</span>
                        <span className={styles.statValue}>
                            {countDisplayMode === 'votes' ? (
                                <CountUp end={totalVotes.constituencyTotal} separator="," duration={1} />
                            ) : (
                                <>
                                    <CountUp end={totalVotes.constituencyPercent || 0} decimals={2} duration={1} />%
                                </>
                            )}
                        </span>
                    </div>
                </div>
                <div className={styles.headerStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>บัญชีรายชื่อ</span>
                        <span className={styles.statLabelSmall}>นับแล้ว</span>
                        <span className={styles.statValue}>
                            {countDisplayMode === 'votes' ? (
                                <CountUp end={totalVotes.partyListTotal} separator="," duration={1} />
                            ) : (
                                <>
                                    <CountUp end={totalVotes.partyListPercent || 0} decimals={2} duration={1} />%
                                </>
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.partyListContainer} key={currentIndex}>
                {visibleParties.map((party, index) => (
                    <PartyRow
                        key={party.name}
                        party={party}
                        index={index}
                        rank={(currentIndex * 5) + index + 1}
                    />
                ))}
            </div>
        </div>
    );
}
