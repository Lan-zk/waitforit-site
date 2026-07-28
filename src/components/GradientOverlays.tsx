import styles from "./GradientOverlays.module.css";

export function GradientOverlays() {
  return (
    <div aria-hidden="true" className={styles.overlays}>
      <div className={styles.topOverlay} />
      <div className={styles.bottomOverlay} />
    </div>
  );
}
