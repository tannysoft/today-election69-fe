// import Image from 'next/image'; // USER REQUEST: Use standard img tag
import { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import styles from './LowerThird.module.css';

export default function ScoreCard({ rank, name, title, firstName, lastName, party, partyLogoUrl, score, color, image, rankPosition = 'top', provinceId, areaNumber, candidateNumber, hidePartyLabel = false, imageCentered = false, nameFontSize = null }) {
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
    // Construct Image URL
    const [finalImageUrl, setFinalImageUrl] = useState(null);

    useEffect(() => {
        const url = (provinceId && areaNumber && candidateNumber && image)
            ? `https://files-election69.livetubex.com/candidates/${provinceId}/${areaNumber}/${candidateNumber}.png`
            : (image ? image : (partyLogoUrl ? partyLogoUrl : null));

        if (url) {
            const img = new Image();
            img.src = url;
            img.onload = () => setFinalImageUrl(url);
            img.onerror = () => setFinalImageUrl(null); // Hide if fail
        } else {
            setFinalImageUrl(null);
        }
    }, [provinceId, areaNumber, candidateNumber, image, partyLogoUrl]);

    // Handle Background Fallback
    useEffect(() => {
        if (!party) {
            setBgUrl(null);
            return;
        }
        const targetUrl = `/parties/lowerthird/${party}.svg`;
        const img = new Image();
        img.src = targetUrl;
        img.onload = () => setBgUrl(targetUrl);
        img.onerror = () => setBgUrl('/parties/lowerthird/default.svg');
    }, [party]);

    const isHex = color?.startsWith('#');
    // const scoreColor = isHex ? getTextColor(color) : 'white'; // Removed dynamic color

    return (
        <div
            className={`${styles.card} ${rank === 1 ? styles.rank1 : ''} ${rankPosition === 'bottom' ? styles.rankBottom : ''}`}
            style={{
                backgroundImage: bgUrl ? `url("${bgUrl}")` : 'none',
                backgroundRepeat: 'no-repeat',
                animationDelay: `${(rank - 1) * 0.15 + 0.3}s`
            }}
        >
            {/* Rank Badge - Top Right */}
            {rank !== null && (
                <div className={styles.rankCircle}>
                    {rankPosition === 'bottom' ? `อันดับที่ ${rank}` : rank}
                </div>
            )}

            {/* Portrait - Left, overlapping both rows */}
            <div className={styles.portraitCircle}>
                {finalImageUrl ? (
                    <img
                        src={finalImageUrl}
                        alt={name}
                        className={styles.portraitImage}
                        style={{
                            objectPosition: imageCentered ? 'center center' : 'center 10px',
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', background: '#ccc' }} />
                )}

                {/* Party Logo Overlay - Bottom Left of Portrait */}
                {partyLogoUrl && (
                    <img
                        src={partyLogoUrl}
                        className={styles.partyLogoOverlay}
                        alt="Party Logo"
                    />
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
                                whiteSpace: 'nowrap',
                                fontSize: nameFontSize || undefined // Apply font size override
                            }}
                        >
                            {displayName}
                        </div>
                        {!hidePartyLabel && <div className={styles.party} style={{ animationDelay: `${((rank - 1) * 0.15) + 0.7}s` }}>{party}</div>}
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
                        <div className={styles.scoreMain}>
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
