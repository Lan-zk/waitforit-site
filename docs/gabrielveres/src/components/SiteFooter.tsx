import styles from "./SiteFooter.module.css";

function SwappingLabel({ children }: { children: string }) {
  return (
    <span className={styles.labelViewport}>
      <span className={styles.labelTrack}>
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <a className={styles.emailLink} href="mailto:office@humanist.ro">
        office@humanist.ro
      </a>

      <span className={styles.sceneLabel}>Overview</span>

      <a className={styles.indexLink} href="/projects">
        <SwappingLabel>Index</SwappingLabel>
      </a>
    </footer>
  );
}
