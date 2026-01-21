"use client";

import { useState, useEffect } from 'react';
import { getElectionData } from '@/services/electionService';
import { getSettings, updateSettings } from '@/services/settingsService';
import styles from './page.module.css';

export default function ControllerPage() {
    const [provinces, setProvinces] = useState([]);
    const [allAreas, setAllAreas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State (Pending Selection)
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [hideZero, setHideZero] = useState(false);
    const [removeBg, setRemoveBg] = useState(false);

    // Applied State (What is actually active in DB/Area Page)
    const [appliedProvince, setAppliedProvince] = useState("");
    const [appliedDistrict, setAppliedDistrict] = useState("");
    const [appliedHideZero, setAppliedHideZero] = useState(false);
    const [appliedRemoveBg, setAppliedRemoveBg] = useState(false);

    // PocketBase Settings ID
    const [settingsId, setSettingsId] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        async function initData() {
            setLoading(true);
            try {
                // 1. Fetch Election Data for Dropdowns
                const data = await getElectionData();
                setAllAreas(data);

                // Extract unique provinces
                const uniqueProvinces = [...new Set(data.map(item => item._provinceName))].sort();
                setProvinces(uniqueProvinces);

                // 2. Fetch Current Settings via Server Action (Handles Admin Auth & Auto-Create)
                try {
                    const settings = await getSettings();
                    if (settings) {
                        setSettingsId(settings.id);

                        // Set both selected and applied to current DB value
                        const prov = settings.filter_province || "";
                        const dist = settings.filter_district || "";
                        const hide = settings.hide_zero_score || false;
                        const rmBg = settings.remove_background || false;

                        setSelectedProvince(prov);
                        setSelectedDistrict(dist);
                        setHideZero(hide);
                        setRemoveBg(rmBg);

                        setAppliedProvince(prov);
                        setAppliedDistrict(dist);
                        setAppliedHideZero(hide);
                        setAppliedRemoveBg(rmBg);
                    } else {
                        setStatusMessage("Failed to load settings from server.");
                    }
                } catch (err) {
                    console.error("Error fetching settings:", err);
                    setStatusMessage("Error connecting to settings service.");
                }

            } catch (error) {
                console.error("Error initializing controller:", error);
            } finally {
                setLoading(false);
            }
        }

        initData();
    }, []);

    // Helper to update
    const handleUpdate = async (province, district, hide, rmBg) => {
        if (!settingsId) return;

        setStatusMessage("Updating...");
        try {
            const success = await updateSettings(settingsId, {
                filter_province: province,
                filter_district: district,
                hide_zero_score: hide,
                remove_background: rmBg
            });

            if (success) {
                // Update APPLIED state only on success
                setAppliedProvince(province);
                setAppliedDistrict(district);
                setAppliedHideZero(hide);
                setAppliedRemoveBg(rmBg);
                setStatusMessage("Update Successful");
            } else {
                setStatusMessage("Update Failed (Server Error)");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            setStatusMessage("Update Failed");
        }
    };

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        setSelectedProvince(value);
        setSelectedDistrict(""); // Reset district pending
    };

    const handleDistrictChange = (e) => {
        const value = e.target.value;
        setSelectedDistrict(value);
    };

    const handleHideZeroChange = (e) => {
        setHideZero(e.target.checked);
    };

    const handleRemoveBgChange = (e) => {
        setRemoveBg(e.target.checked);
    };

    const handleApply = () => {
        handleUpdate(selectedProvince, selectedDistrict, hideZero, removeBg);
    };

    const handleReset = () => {
        // Reset only filters, keep system toggles (hideZero, removeBg)
        setSelectedProvince("");
        setSelectedDistrict("");
        // Keep current status of toggles
        handleUpdate("", "", hideZero, removeBg);
    };

    // Filter districts based on selected province
    const availableDistricts = allAreas
        .filter(area => area._provinceName === selectedProvince)
        .map(area => area._zoneNumber)
        .sort((a, b) => a - b);

    if (loading) return <div className={styles.container}>Loading Controller...</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Display Controller</h1>

            <div className={styles.rowGroup}>
                <div className={styles.controlGroup}>
                    <label className={styles.label}>Province (จังหวัด)</label>
                    <select
                        className={styles.select}
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                    >
                        <option value="">-- Show All Provinces --</option>
                        {provinces.map((prov, idx) => (
                            <option key={idx} value={prov}>{prov}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.controlGroup}>
                    <label className={styles.label}>District (เขต)</label>
                    <select
                        className={styles.select}
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                    >
                        <option value="">-- Show All Districts --</option>
                        {availableDistricts.map((dist, idx) => (
                            <option key={idx} value={dist}>เขต {dist}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.rowGroup}>
                <div className={styles.controlGroup}>
                    <div className={styles.toggleContainer}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={hideZero}
                                onChange={handleHideZeroChange}
                            />
                            <span className={`${styles.slider} ${styles.round}`}></span>
                        </label>
                        <span className={styles.toggleLabel}>hide_zero_score</span>
                    </div>
                </div>

                <div className={styles.controlGroup}>
                    <div className={styles.toggleContainer}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={removeBg}
                                onChange={handleRemoveBgChange}
                            />
                            <span className={`${styles.slider} ${styles.round}`}></span>
                        </label>
                        <span className={styles.toggleLabel}>remove_background</span>
                    </div>
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <button
                    className={styles.applyButton}
                    onClick={handleApply}
                >
                    Apply Filter
                </button>

                <button
                    className={styles.resetButton}
                    onClick={handleReset}
                >
                    Reset Filters (Show All)
                </button>
            </div>

            <div className={styles.status}>
                <strong>Status:</strong> {statusMessage}
                <div className={styles.activeFilters}>
                    Current Applied: {appliedProvince || "All"} {appliedDistrict ? `> เขต ${appliedDistrict}` : ""} {appliedHideZero ? "(Hide 0 Score)" : ""} {appliedRemoveBg ? "(Remove BG)" : ""}
                </div>
            </div>
        </div>
    );
}
