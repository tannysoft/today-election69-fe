import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 800, textAlign: 'center' }}>
          Election 69
        </h1>
        <p style={{ marginTop: '1rem', opacity: 0.8, fontSize: '1.2rem' }}>
          A premium web experience.
        </p>
      </div>
    </main>
  );
}
