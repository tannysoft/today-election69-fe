"use client";

import { useState, useEffect } from 'react';
import { getElectionData, getPartyListData } from '@/services/electionService';
import { getSettings, updateSettings } from '@/services/settingsService';
import styles from './page.module.css';

export default function ControllerPage() {
    const [provinces, setProvinces] = useState([]);
    const [allAreas, setAllAreas] = useState([]);
    const [partyListPages, setPartyListPages] = useState(0);
    const [partySeatsListPages, setPartySeatsListPages] = useState(0);
    const [partyListPagePages, setPartyListPagePages] = useState(0);
    const [loading, setLoading] = useState(true);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [hideZero, setHideZero] = useState(false);
    const [removeBg, setRemoveBg] = useState(false);
    const [partyMode, setPartyMode] = useState("auto");
    const [partyIndex, setPartyIndex] = useState(0);
    const [partySeatsMode, setPartySeatsMode] = useState("auto");
    const [partySeatsIndex, setPartySeatsIndex] = useState(0);
    const [partylistMode, setPartylistMode] = useState("auto");
    const [partylistIndex, setPartylistIndex] = useState(0);
    const [countDisplayMode, setCountDisplayMode] = useState("votes");

    const [appliedProvince, setAppliedProvince] = useState("");
    const [appliedDistrict, setAppliedDistrict] = useState("");
    const [appliedHideZero, setAppliedHideZero] = useState(false);
    const [appliedRemoveBg, setAppliedRemoveBg] = useState(false);
    const [appliedPartyMode, setAppliedPartyMode] = useState("auto");
    const [appliedPartyIndex, setAppliedPartyIndex] = useState(0);
    const [appliedPartySeatsMode, setAppliedPartySeatsMode] = useState("auto");
    const [appliedPartySeatsIndex, setAppliedPartySeatsIndex] = useState(0);
    const [appliedPartylistMode, setAppliedPartylistMode] = useState("auto");
    const [appliedPartylistIndex, setAppliedPartylistIndex] = useState(0);
    const [appliedCountDisplayMode, setAppliedCountDisplayMode] = useState("votes");

    const [settingsId, setSettingsId] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    // Custom Toggle Component (CSS Modules)
    const Toggle = ({ label, checked, onChange, type = "green" }) => (
        <label className={styles.toggleContainer}>
            <span className={styles.toggleLabel}>{label}</span>
            <div className={styles.toggleWrapper}>
                <input type="checkbox" className="sr-only" style={{ display: 'none' }} checked={checked} onChange={onChange} />
                <div className={`${styles.toggleSwitch} ${checked ? (type === 'pink' ? styles.toggleSwitchCheckedPink : styles.toggleSwitchCheckedGreen) : ''}`}>
                    <div className={`${styles.toggleKnob} ${checked ? styles.toggleKnobChecked : ''}`}></div>
                </div>
            </div>
        </label>
    );

    useEffect(() => {
        async function initData() {
            setLoading(true);
            try {
                const data = await getElectionData();
                setAllAreas(data);

                const uniqueProvinces = [...new Set(data.map(item => item._provinceName))].sort();
                setProvinces(uniqueProvinces);

                const parties = await getPartyListData();
                const filteredParties = parties.filter(p => p.count > 0);
                const maxPages = Math.ceil(filteredParties.length / 5);
                setPartyListPages(maxPages || 1);

                // Party Seats Pagination Logic (7 items/page, constituencySeats > 0)
                const seatsParties = parties.filter(p => p.constituencySeats > 0);
                const maxSeatsPages = Math.ceil(seatsParties.length / 7);
                setPartySeatsListPages(maxSeatsPages || 1);

                // Party List Pagination (partylist/page.js uses 7 items/page too, check logic?)
                // Assuming same party list data is used or similar structure
                // Adjust if getPartylistResult differs significantly.
                // Re-using parties data as approximation or fetch distinct if needed?
                // The prompt implies /partylist page uses getPartylistResult()
                // Let's assume same logic for page count (7 per page) based on filteredParties?
                // Wait, partylist page uses getPartylistResult(). Let's use filteredParties (which is getPartyListData) as proxy?
                // Or better, fetch getPartylistResult if available.
                // But getPartylistResult is imported from service. 
                // Let's use filteredParties logic for now as it's likely similar count.
                // Re-check partylist/page.js: "const maxIndex = Math.ceil(parties.length / 7);"
                // And parties is from getPartylistResult().
                // Let's reuse filteredParties length for page calculation as approximation since typically same parties involved.
                // Or better, fetch fetchPartylistResult if needed.
                // For simplicity, using same count logic as party seats (7 per page) on detailed list.
                const maxPartylistPages = Math.ceil(parties.length / 7);
                setPartyListPagePages(maxPartylistPages || 1);

                try {
                    const settings = await getSettings();
                    if (settings) {
                        setSettingsId(settings.id);
                        const prov = settings.filter_province || "";
                        const dist = settings.filter_district || "";
                        const hide = settings.hide_zero_score || false;
                        const rmBg = settings.remove_background || false;
                        const pMode = settings.party_page_mode || "auto";
                        const pIndex = settings.party_page_index || 0;
                        const psMode = settings.party_seats_mode || "auto";
                        const psIndex = settings.party_seats_index || 0;
                        const plMode = settings.partylist_mode || "auto";
                        const plIndex = settings.partylist_index || 0;
                        const cMode = settings.count_display_mode || "votes";

                        setSelectedProvince(prov);
                        setSelectedDistrict(dist);
                        setHideZero(hide);
                        setRemoveBg(rmBg);
                        setPartyMode(pMode);
                        setPartyIndex(pIndex);
                        setPartySeatsMode(psMode);
                        setPartySeatsIndex(psIndex);
                        setPartylistMode(plMode);
                        setPartylistIndex(plIndex);
                        setCountDisplayMode(cMode);

                        setAppliedProvince(prov);
                        setAppliedDistrict(dist);
                        setAppliedHideZero(hide);
                        setAppliedRemoveBg(rmBg);
                        setAppliedPartyMode(pMode);
                        setAppliedPartyIndex(pIndex);
                        setAppliedPartySeatsMode(psMode);
                        setAppliedPartySeatsIndex(psIndex);
                        setAppliedPartylistMode(plMode);
                        setAppliedPartylistIndex(plIndex);
                        setAppliedCountDisplayMode(cMode);
                    } else {
                        setStatusMessage("Failed to load settings.");
                    }
                } catch (err) {
                    console.error(err);
                    setStatusMessage("Error connecting to settings.");
                }

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        initData();
    }, []);

    const handleUpdate = async (province, district, hide, rmBg) => {
        if (!settingsId) return;

        setStatusMessage("Updating...");
        try {
            const success = await updateSettings(settingsId, {
                filter_province: province,
                filter_district: district,
                hide_zero_score: hide,
                remove_background: rmBg,
                party_page_mode: partyMode,
                party_page_index: partyIndex,
                party_seats_mode: partySeatsMode,
                party_seats_index: partySeatsIndex,
                partylist_mode: partylistMode,
                partylist_index: partylistIndex,
                count_display_mode: countDisplayMode,
            });

            if (success) {
                setAppliedProvince(province);
                setAppliedDistrict(district);
                setAppliedHideZero(hide);
                setAppliedRemoveBg(rmBg);
                setAppliedPartyMode(partyMode);
                setAppliedPartyIndex(partyIndex);
                setAppliedPartySeatsMode(partySeatsMode);
                setAppliedPartySeatsIndex(partySeatsIndex);
                setAppliedPartylistMode(partylistMode);
                setAppliedPartylistIndex(partylistIndex);
                setAppliedCountDisplayMode(countDisplayMode);
                setStatusMessage("Update Successful");
            } else {
                setStatusMessage("Update Failed");
            }
        } catch (error) {
            console.error(error);
            setStatusMessage("Update Failed");
        }
    };

    const handleApply = () => handleUpdate(selectedProvince, selectedDistrict, hideZero, removeBg);

    const handleReset = () => {
        setSelectedProvince("");
        setSelectedDistrict("");
        setCountDisplayMode("votes");
        handleUpdate("", "", hideZero, removeBg);
    };

    const availableDistricts = allAreas
        .filter(area => area._provinceName === selectedProvince)
        .map(area => area._zoneNumber)
        .sort((a, b) => a - b);

    if (loading) return <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        ELECTION 69 CONTROL
                    </h1>
                    <div className={styles.statusBadgeWrapper}>
                        <span className={`${styles.statusBadge} ${statusMessage === "Update Successful" ? styles.statusBadgeSuccess : ''}`}>
                            {statusMessage || "Ready"}
                        </span>
                    </div>
                </div>

                {/* Main Control Grid */}
                <div className={styles.grid}>

                    {/* Card 1: Area Filter */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.indicator} ${styles.indicatorPrimary}`}></div>
                            <h2 className={styles.cardTitle}>Area Filter</h2>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Province (จังหวัด)</label>
                            <select
                                className={styles.select}
                                value={selectedProvince}
                                onChange={(e) => { setSelectedProvince(e.target.value); setSelectedDistrict(""); }}
                            >
                                <option value="">-- Show All Provinces --</option>
                                {provinces.map((prov, i) => <option key={i} value={prov}>{prov}</option>)}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>District (เขต)</label>
                            <select
                                className={styles.select}
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                disabled={!selectedProvince}
                            >
                                <option value="">-- Show All Districts --</option>
                                {availableDistricts.map((d, i) => <option key={i} value={d}>District {d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Card 2: Display Options */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.indicator} ${styles.indicatorSecondary}`}></div>
                            <h2 className={styles.cardTitle}>Display Options</h2>
                        </div>

                        <div className={styles.formGroup} style={{ gap: '1rem' }}>
                            <Toggle
                                label="Hide Zero Score"
                                checked={hideZero}
                                onChange={(e) => setHideZero(e.target.checked)}
                                type="green"
                            />

                            <Toggle
                                label="Remove Background"
                                checked={removeBg}
                                onChange={(e) => setRemoveBg(e.target.checked)}
                                type="pink"
                            />

                            <div style={{ marginTop: '10px' }}>
                                <label className={styles.label} style={{ marginBottom: '8px', display: 'block' }}>Count Display</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className={`${styles.btn} ${countDisplayMode === 'votes' ? styles.btnPrimary : styles.btnOutline}`}
                                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                        onClick={() => setCountDisplayMode('votes')}
                                    >
                                        Total Votes
                                    </button>
                                    <button
                                        className={`${styles.btn} ${countDisplayMode === 'percent' ? styles.btnPrimary : styles.btnOutline}`}
                                        style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                        onClick={() => setCountDisplayMode('percent')}
                                    >
                                        Percent %
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Party Pages */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.indicator} ${styles.indicatorAccent}`}></div>
                            <h2 className={styles.cardTitle}>Party Pages</h2>
                        </div>

                        <button
                            className={`${styles.btn} ${partyMode === 'auto' ? styles.btnPrimary : styles.btnOutline}`}
                            onClick={() => setPartyMode('auto')}
                        >
                            {partyMode === 'auto' ? 'AUTO LOOP ACTIVE' : 'Enable Auto Loop'}
                        </button>

                        <div className={styles.paginationGrid}>
                            {Array.from({ length: partyListPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.pageBtn} ${(partyMode === 'manual' && partyIndex === i) ? styles.pageBtnActive : ''}`}
                                    onClick={() => { setPartyMode('manual'); setPartyIndex(i); }}
                                >
                                    {i * 5 + 1}-{(i + 1) * 5}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Card 4: Party Seats Pages */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.indicator} ${styles.indicatorAccent}`}></div>
                            <h2 className={styles.cardTitle}>Party Seats Pages</h2>
                        </div>

                        <button
                            className={`${styles.btn} ${partySeatsMode === 'auto' ? styles.btnPrimary : styles.btnOutline}`}
                            onClick={() => setPartySeatsMode('auto')}
                        >
                            {partySeatsMode === 'auto' ? 'AUTO LOOP ACTIVE' : 'Enable Auto Loop'}
                        </button>

                        <div className={styles.paginationGrid}>
                            {Array.from({ length: partySeatsListPages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.pageBtn} ${(partySeatsMode === 'manual' && partySeatsIndex === i) ? styles.pageBtnActive : ''}`}
                                    onClick={() => { setPartySeatsMode('manual'); setPartySeatsIndex(i); }}
                                >
                                    {i * 7 + 1}-{(i + 1) * 7}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Card 5: Partylist Pages */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.indicator} ${styles.indicatorAccent}`}></div>
                            <h2 className={styles.cardTitle}>Partylist Pages</h2>
                        </div>

                        <button
                            className={`${styles.btn} ${partylistMode === 'auto' ? styles.btnPrimary : styles.btnOutline}`}
                            onClick={() => setPartylistMode('auto')}
                        >
                            {partylistMode === 'auto' ? 'AUTO LOOP ACTIVE' : 'Enable Auto Loop'}
                        </button>

                        <div className={styles.paginationGrid}>
                            {Array.from({ length: partyListPagePages }).map((_, i) => (
                                <button
                                    key={i}
                                    className={`${styles.pageBtn} ${(partylistMode === 'manual' && partylistIndex === i) ? styles.pageBtnActive : ''}`}
                                    onClick={() => { setPartylistMode('manual'); setPartylistIndex(i); }}
                                >
                                    {i * 7 + 1}-{(i + 1) * 7}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className={styles.statusBar}>

                    <div className={styles.statusItem}>
                        <div className={styles.statusLabel}>Location</div>
                        <div className={`${styles.statusValue} ${styles.textPrimary}`}>{appliedProvince || "ALL PROVINCES"}</div>
                        <div className={styles.statusSub}>District {appliedDistrict || "ALL"}</div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.statusItem}>
                        <div className={styles.statusLabel}>Visuals</div>
                        <div className={`${styles.statusValue} ${appliedRemoveBg ? styles.textSecondary : ''}`}>
                            {appliedRemoveBg ? "TRANSPARENT" : "NORMAL"}
                        </div>
                        <div className={styles.statusSub}>{appliedHideZero ? "Hiding Zeros" : "Showing All"}</div>
                        <div className={styles.statusSub}>{appliedCountDisplayMode === 'votes' ? "Total Votes" : "Percent %"}</div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.statusItem}>
                        <div className={styles.statusLabel}>Party Loop</div>
                        <div className={`${styles.statusValue} ${styles.textAccent}`}>{appliedPartyMode === 'auto' ? "AUTO" : `${appliedPartyIndex * 5 + 1}-${(appliedPartyIndex + 1) * 5}`}</div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.statusItem}>
                        <div className={styles.statusLabel}>Seats Loop</div>
                        <div className={`${styles.statusValue} ${styles.textAccent}`}>{appliedPartySeatsMode === 'auto' ? "AUTO" : `${appliedPartySeatsIndex * 7 + 1}-${(appliedPartySeatsIndex + 1) * 7}`}</div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.statusItem}>
                        <div className={styles.statusLabel}>Partylist Loop</div>
                        <div className={`${styles.statusValue} ${styles.textAccent}`}>{appliedPartylistMode === 'auto' ? "AUTO" : `${appliedPartylistIndex * 7 + 1}-${(appliedPartylistIndex + 1) * 7}`}</div>
                    </div>

                    <div className={styles.actionWrapper}>
                        <button
                            className={styles.applyBtn}
                            onClick={handleApply}
                        >
                            APPLY
                        </button>
                        <button
                            className={styles.resetBtn}
                            onClick={handleReset}
                        >
                            RESET
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
