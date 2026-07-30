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
      data-reading-kind={kind}
    >
      {active && kind === 'blog' ? (
        <SideRays
          blend={0.75}
          className={styles.canvas}
          falloff={1.6}
          intensity={2}
          onError={handleError}
          opacity={1}
          origin="top-right"
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          saturation={1.5}
          speed={2.5}
          spread={2}
          tilt={0}
        />
      ) : null}
      {active && kind === 'novel' ? (
        <Galaxy className={styles.canvas} onError={handleError} />
      ) : null}
    </div>
  )
}
