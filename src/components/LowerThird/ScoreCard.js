// import Image from 'next/image'; // USER REQUEST: Use standard img tag
import { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import styles from './LowerThird.module.css';

export default function ScoreCard({ rank, name, title, firstName, lastName, party, partyLogoUrl, score, color, image, rankPosition = 'top', provinceId, areaNumber, candidateNumber }) {
    const [bgUrl, setBgUrl] = useState(null);
    const nameRef = useRef(null);
    const nameContainerRef = useRef(null);

    // Format Name
    let displayName = name;
    const commonTitles = ['นาย', 'นาง', 'นางสาว'];

    if (commonTitles.includes(title)) {
        displayName = `${firstName} ${lastName}`;
    }

    // Auto-scale Name if too long
    useEffect(() => {
        if (nameRef.current && nameContainerRef.current) {
            const parentWidth = nameContainerRef.current.clientWidth;
            const textWidth = nameRef.current.scrollWidth;

            if (textWidth > parentWidth) {
                const scale = parentWidth / textWidth;
                nameRef.current.style.transform = `scaleX(${scale})`;
                nameRef.current.style.transformOrigin = 'left center';
                nameRef.current.style.width = `${textWidth}px`; // Fix width to full size so transform squashes it into place? 
                // Actually, if we just scaleX, it shrinks visually but takes same space? No. 
                // We should probably just set transform. But if we don't set width, text might wrap? 
                // whiteSpace: nowrap prevents wrapping.
            } else {
                nameRef.current.style.transform = 'none';
                nameRef.current.style.width = 'auto'; // Reset width
            }
        }
    }, [displayName]);

    // Construct Image URL
    const imageUrl = (provinceId && areaNumber && candidateNumber && image)
        ? `https://files-election69.livetubex.com/candidates/${provinceId}/${areaNumber}/${candidateNumber}.png`
        : (image ? image : null);

    // Handle Background Fallback
    useEffect(() => {
        if (!party) {
            setBgUrl(null);
            return;
        }
        const targetUrl = `/parties/${party}.svg`;
        const img = new Image();
        img.src = targetUrl;
        img.onload = () => setBgUrl(targetUrl);
        img.onerror = () => setBgUrl('/parties/default.svg');
    }, [party]);

    // Helper to determine text color based on background brightness
    const getTextColor = (hex) => {
        if (!hex) return 'white'; // Default for gradients/missing
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        // Calculate YIQ brightness
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    };

    const isHex = color?.startsWith('#');
    const scoreColor = isHex ? getTextColor(color) : 'white';

    return (
        <div
            className={`${styles.card} ${rank === 1 ? styles.rank1 : ''} ${rankPosition === 'bottom' ? styles.rankBottom : ''}`}
            style={{ backgroundImage: bgUrl ? `url("${bgUrl}")` : 'none', animationDelay: `${(rank - 1) * 0.15 + 0.3}s` }}
        >
            {/* Rank Badge - Top Right */}
            <div className={styles.rankCircle}>
                {rankPosition === 'bottom' ? `อันดับที่ ${rank}` : rank}
            </div>

            {/* Portrait - Left, overlapping both rows */}
            <div className={styles.portraitCircle}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center 10px',
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#ccc' }} />
                )}
            </div>

            <div className={styles.cardInner}>

                {/* Top Row: Black Background (if no SVG), Name & Party */}
                <div
                    className={styles.topRow}
                    style={{ background: bgUrl ? 'transparent' : '#222' }}
                >
                    <div className={styles.infoContent} ref={nameContainerRef} style={{ width: '100%', overflow: 'visible' }}>
                        <div
                            ref={nameRef}
                            className={styles.name}
                            style={{
                                animationDelay: `${((rank - 1) * 0.15) + 0.6}s`,
                                display: 'inline-block',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {displayName}
                        </div>
                        <div className={styles.party} style={{ animationDelay: `${((rank - 1) * 0.15) + 0.7}s` }}>{party}</div>
                    </div>
                </div>

                {/* Bottom Row: Colored Background (if no SVG), Score */}
                <div
                    className={styles.bottomRow}
                    style={{
                        backgroundColor: bgUrl ? 'transparent' : (color || '#ff6600'),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className={styles.scoreContent}>
                        <div className={styles.scoreMain} style={{ color: scoreColor }}>
                            <CountUp end={score} duration={1} separator="," />
                        </div>

                        {/* The "Score Label" Tab - Black slanted box on the right */}
                        <div className={styles.scoreLabelTab} style={{ animationDelay: `${((rank - 1) * 0.15) + 0.4}s` }}>
                            <span>คะแนน</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
