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
  labels: {
    index: string;
    overview: string;
  };
}

export function SiteFooter({ email, indexHref, labels }: SiteFooterProps) {
  return (
    <footer className={styles.siteFooter}>
      {email ? (
        <a className={styles.emailLink} href={`mailto:${email}`}>
          {email}
        </a>
      ) : (
        <span aria-hidden="true" />
      )}

      <div className={styles.footerActions}>
        <span className={styles.sceneLabel}>{labels.overview}</span>

        <a className={styles.indexLink} href={indexHref}>
          <SwappingLabel>{labels.index}</SwappingLabel>
        </a>
      </div>
    </footer>
  );
}
