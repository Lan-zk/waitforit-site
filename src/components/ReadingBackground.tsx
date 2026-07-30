'use client'

import { useCallback, useEffect, useState } from 'react'

import Galaxy from './Galaxy/Galaxy'
import styles from './ReadingBackground.module.css'
import SideRays from './SideRays/SideRays'

interface ReadingBackgroundProps {
  kind: 'blog' | 'novel'
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

export function ReadingBackground({ kind }: ReadingBackgroundProps) {
  const [canRender, setCanRender] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      setCanRender(
        !document.hidden && !reducedMotion.matches && supportsWebGL(),
      )
    }

    sync()
    document.addEventListener('visibilitychange', sync)
    reducedMotion.addEventListener('change', sync)

    return () => {
      document.removeEventListener('visibilitychange', sync)
      reducedMotion.removeEventListener('change', sync)
    }
  }, [])

  const handleError = useCallback(() => {
    setFailed(true)
  }, [])
  const active = canRender && !failed
  const mode = active ? (kind === 'blog' ? 'side-rays' : 'galaxy') : 'fallback'

  return (
    <div
      aria-hidden="true"
      className={`${styles.background} ${styles[kind]}`}
      data-reading-background={mode}
    >
      {active && kind === 'blog' ? (
        <SideRays
          blend={0.7}
          className={styles.canvas}
          falloff={1.75}
          intensity={0.72}
          onError={handleError}
          opacity={0.28}
          rayColor1="#002FA7"
          rayColor2="#B8C4FF"
          saturation={1.1}
          speed={1.1}
          spread={1.25}
        />
      ) : null}
      {active && kind === 'novel' ? (
        <Galaxy className={styles.canvas} onError={handleError} />
      ) : null}
    </div>
  )
}
