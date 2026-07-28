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

interface SiteFooterProps {
  email: string;
  indexHref: string;
}

export function SiteFooter({ email, indexHref }: SiteFooterProps) {
  return (
    <footer className={styles.siteFooter}>
      <a className={styles.emailLink} href={`mailto:${email}`}>
        {email}
      </a>

      <span className={styles.sceneLabel}>Overview</span>

      <a className={styles.indexLink} href={indexHref}>
        <SwappingLabel>Index</SwappingLabel>
      </a>
    </footer>
  );
}
