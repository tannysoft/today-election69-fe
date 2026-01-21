import Link from 'next/link';
import styles from "./page.module.css";

export default function Home() {
  const links = [
    {
      href: "/area",
      title: "Area (Lower Third)",
      description: "Default lower-third view for area election results."
    },
    {
      href: "/area-fullpage",
      title: "Area Fullpage",
      description: "Full screen display for area results with candidate grid."
    },
    {
      href: "/parties",
      title: "Parties",
      description: "Sidebar view showing total seats per party."
    },
    {
      href: "/partylist",
      title: "Party List",
      description: "Party list seats ranking and display."
    },
    {
      href: "/referendum",
      title: "Referendum",
      description: "Referendum results display."
    },
    {
      href: "/controller",
      title: "Controller",
      description: "Control panel for area selection and settings."
    }
  ];

  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 800, textAlign: 'center' }}>
          Election 69
        </h1>
        <p style={{ marginTop: '1rem', opacity: 0.8, fontSize: '1.2rem' }}>
          Real-time Election Graphics System
        </p>
      </div>

      <div className={styles.grid}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={styles.card}>
            <h2>
              {link.title}
            </h2>
            <p>{link.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
