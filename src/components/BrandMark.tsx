type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
    >
      W
    </span>
  )
}
