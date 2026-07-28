"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "./BrandMark";
import styles from "./SiteHeader.module.css";

const navigation = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
] as const;

function formatLocalTime(date: Date) {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const twelveHour = String(hours % 12 || 12).padStart(2, "0");

  return `${twelveHour}:${minutes} ${period}`;
}

function useLocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    let minuteTimer: ReturnType<typeof setInterval> | undefined;

    const updateTime = () => setTime(formatLocalTime(new Date()));
    const now = new Date();
    const millisecondsUntilNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    updateTime();

    const alignmentTimer = window.setTimeout(() => {
      updateTime();
      minuteTimer = setInterval(updateTime, 60_000);
    }, millisecondsUntilNextMinute);

    return () => {
      window.clearTimeout(alignmentTimer);
      if (minuteTimer) clearInterval(minuteTimer);
    };
  }, []);

  return time;
}

function PillLink({ href, label }: { href: string; label: string }) {
  return (
    <a className={styles.pill} href={href}>
      <span className={styles.labelTrack}>
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
    </a>
  );
}

function HomeLink({ mobile = false }: { mobile?: boolean }) {
  return (
    <a
      aria-label="Home"
      className={`${styles.homeLink} ${mobile ? styles.mobileHomeLink : ""}`}
      href="/"
    >
      <BrandMark className={styles.brandMark} />
    </a>
  );
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.globeIcon}
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="6.35" />
      <path d="M1.9 8h12.2M8 1.65c1.7 1.73 2.55 3.85 2.55 6.35S9.7 12.62 8 14.35M8 1.65C6.3 3.38 5.45 5.5 5.45 8S6.3 12.62 8 14.35" />
    </svg>
  );
}

export function SiteHeader() {
  const time = useLocalTime();

  return (
    <header className={styles.siteHeader}>
      <div className={styles.desktopHeader}>
        <div className={styles.leftGroup}>
          <HomeLink />
          <nav aria-label="Primary navigation" className={styles.navigation}>
            {navigation.map((item) => (
              <PillLink key={item.href} {...item} />
            ))}
          </nav>
        </div>

        <a className={styles.wordmark} href="/">
          GABRIEL VERES
        </a>

        <div className={styles.rightGroup}>
          <PillLink href="/contact" label="Contact" />
          <div
            aria-label={time ? `Local time ${time}` : "Local time"}
            className={styles.timeCapsule}
          >
            <span className={styles.desktopTime}>{time || "\u00a0"}</span>
            <GlobeIcon />
          </div>
        </div>
      </div>

      <div className={styles.mobileHeader}>
        <time className={styles.mobileTime}>{time || "\u00a0"}</time>
        <HomeLink mobile />
      </div>
    </header>
  );
}
