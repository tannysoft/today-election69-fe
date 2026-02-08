"use client";

import { useState, useEffect } from 'react';
import { getCandidatesWithWebsitePhotos, approveCandidatePhoto, getPhotoApprovalStats } from '@/services/candidateService';

export default function ApprovePhotosPage() {
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats] = useState({ total: 0, approved: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [candidatesData, statsData] = await Promise.all([
            getCandidatesWithWebsitePhotos(),
            getPhotoApprovalStats()
        ]);
        setCandidates(candidatesData);
        setStats(statsData);
        setLoading(false);
    };

    const handleApprove = async (id) => {
        const result = await approveCandidatePhoto(id, true);
        if (result.success) {
            // Remove from list since we don't show approved photos anymore
            setCandidates(prev => prev.filter(c => c.id !== id));
            // Update stats
            setStats(prev => ({ ...prev, approved: prev.approved + 1 }));
        } else {
            alert("Failed to approve photo");
        }
    };

    const handleReject = async (id) => {
        const result = await approveCandidatePhoto(id, false);
        if (result.success) {
            setCandidates(prev => prev.map(c => c.id === id ? { ...c, photoApprove: false } : c));
        } else {
            alert("Failed to reject photo");
        }
    };

    const percent = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

    const styles = {
        container: {
            minHeight: '100vh',
            backgroundColor: 'black',
            color: 'white',
            padding: '2rem',
            fontFamily: 'var(--font-dbheavent, sans-serif)',
        },
        headerContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
        },
        header: {
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#eab308', // Yellow-500
            margin: 0,
        },
        stats: {
            fontSize: '1.2rem',
            color: '#9ca3af',
        },
        progressBarContainer: {
            width: '100%',
            height: '10px',
            backgroundColor: '#374151',
            borderRadius: '5px',
            overflow: 'hidden',
            marginBottom: '2rem',
        },
        progressBarFill: {
            height: '100%',
            backgroundColor: '#22c55e',
            width: `${percent}%`,
            transition: 'width 0.3s ease-in-out',
        },
        tableContainer: {
            overflowX: 'auto',
        },
        table: {
            width: '100%',
            textAlign: 'left',
            borderCollapse: 'collapse',
        },
        th: {
            padding: '1rem',
            borderBottom: '1px solid #374151', // Gray-700
            color: '#9ca3af', // Gray-400
            fontSize: '1.125rem', // text-lg
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid #1f2937', // Gray-800
            verticalAlign: 'top',
        },
        row: {
            transition: 'background-color 0.2s',
        },
        rowHover: {
            backgroundColor: '#0f172a', // gray-900
        },
        imgBox: {
            width: '210px',
            height: '280px', // Standardize candidate photo ratio
            backgroundColor: '#1f2937',
            position: 'relative',
            borderRadius: '0.25rem',
            overflow: 'hidden',
            border: '1px solid #374151',
        },
        img: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        },
        label: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '0.25rem 0',
        },
        button: {
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '0.5rem',
            transition: 'background-color 0.2s',
        },
        statusBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid',
            fontWeight: 'bold',
            display: 'inline-block',
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.25rem', color: 'white' }}>Loading candidates...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <h1 style={styles.header}>Approve Candidate Photos</h1>
                <div style={styles.stats}>
                    Approved: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{stats.approved}</span> / {stats.total} ({percent}%)
                </div>
            </div>

            <div style={styles.progressBarContainer}>
                <div style={styles.progressBarFill}></div>
            </div>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Info</th>
                            <th style={styles.th}>Original Photo</th>
                            <th style={styles.th}>New Website Photo</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(candidate => (
                            <tr key={candidate.id} style={styles.row} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.rowHover.backgroundColor} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}>
                                <td style={styles.td}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{candidate.firstName} {candidate.lastName}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                        {candidate.party} <br />
                                        Province: {candidate.province} <br />
                                        District: {candidate.district} No: {candidate.no}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.25rem', fontFamily: 'monospace' }}>{candidate.id}</div>
                                </td>
                                <td style={styles.td}>
                                    {candidate.photoUrl ? (
                                        <div style={styles.imgBox}>
                                            <img
                                                src={candidate.photoUrl}
                                                alt="Original"
                                                style={styles.img}
                                            />
                                            <div style={styles.label}>photoUrl</div>
                                        </div>
                                    ) : (
                                        <div style={{ ...styles.imgBox, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No Image</div>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {candidate.photoUrlWebsite ? (
                                        <div style={{ ...styles.imgBox, borderColor: '#a16207' }}>
                                            <img
                                                src={candidate.photoUrlWebsite}
                                                alt="New"
                                                style={styles.img}
                                            />
                                            <div style={{ ...styles.label, backgroundColor: 'rgba(113, 63, 18, 0.7)' }}>photoUrlWebsite</div>
                                        </div>
                                    ) : (
                                        <div style={{ ...styles.imgBox, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>No Image</div>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    {candidate.photoApprove === true && <span style={{ ...styles.statusBadge, color: '#22c55e', borderColor: '#22c55e' }}>APPROVED</span>}
                                    {candidate.photoApprove === false && <span style={{ ...styles.statusBadge, color: '#ef4444', borderColor: '#ef4444' }}>REJECTED</span>}
                                    {(candidate.photoApprove === undefined || candidate.photoApprove === null) && <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Pending</span>}
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleApprove(candidate.id)}
                                            style={{
                                                ...styles.button,
                                                backgroundColor: candidate.photoApprove === true ? '#15803d' : '#16a34a',
                                                color: 'white',
                                                opacity: candidate.photoApprove === true ? 0.5 : 1,
                                                cursor: candidate.photoApprove === true ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={candidate.photoApprove === true}
                                            onMouseEnter={(e) => { if (candidate.photoApprove !== true) e.currentTarget.style.backgroundColor = '#22c55e'; }}
                                            onMouseLeave={(e) => { if (candidate.photoApprove !== true) e.currentTarget.style.backgroundColor = '#16a34a'; }}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(candidate.id)}
                                            style={{
                                                ...styles.button,
                                                backgroundColor: candidate.photoApprove === false ? '#b91c1c' : '#dc2626',
                                                color: 'white',
                                                opacity: candidate.photoApprove === false ? 0.5 : 1,
                                                cursor: candidate.photoApprove === false ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={candidate.photoApprove === false}
                                            onMouseEnter={(e) => { if (candidate.photoApprove !== false) e.currentTarget.style.backgroundColor = '#ef4444'; }}
                                            onMouseLeave={(e) => { if (candidate.photoApprove !== false) e.currentTarget.style.backgroundColor = '#dc2626'; }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {candidates.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                    No candidates found with website photos.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
