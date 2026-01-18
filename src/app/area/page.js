import LowerThird from '@/components/LowerThird/LowerThird';
import styles from './page.module.css';

export default function AreaPage() {
    return (
        <div className={`${styles.container} ${styles.studioBackground}`}>
            <div style={{
                position: 'absolute',
                top: '200px',
                width: '100%',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.1)',
                fontSize: '3rem',
                fontWeight: 700
            }}>
                1920 x 1080 CAMERA FEED
            </div>

            <LowerThird areaName="กรุงเทพมหานคร เขต 2" />
        </div>
    );
}
