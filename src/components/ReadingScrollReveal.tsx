'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

interface ReadingScrollRevealProps {
  children: ReactNode
  className?: string
}

export function ReadingScrollReveal({
  children,
  className,
}: ReadingScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    )
    if (reducedMotion.matches) return

    let disposed = false
    let revert: (() => void) | undefined

    const setup = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (disposed) return

      gsap.registerPlugin(ScrollTrigger)
      const blocks = Array.from(container.children)
      const context = gsap.context(() => {
        blocks.forEach((block) => {
          gsap.fromTo(
            block,
            {
              filter: 'blur(5px)',
              opacity: 0.22,
            },
            {
              ease: 'none',
              filter: 'blur(0px)',
              opacity: 1,
              scrollTrigger: {
                end: 'top 73%',
                scrub: true,
                start: 'top 98%',
                trigger: block,
              },
            },
          )
        })
      }, container)

      revert = () => {
        context.revert()
      }
    }

    void setup()

    return () => {
      disposed = true
      revert?.()
    }
  }, [])

  return (
    <div
      className={className}
      data-reading-scroll-reveal=""
      ref={containerRef}
    >
      {children}
    </div>
  )
}
