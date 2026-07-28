type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.818 9.313 15.476 1.247l.55.318-4.659 8.069 8.071-4.658.318.55-8.064 4.656H21v.636h-9.31l8.062 4.656-.318.55-8.062-4.655 4.654 8.062-.55.318-4.658-8.067V21h-.636v-9.312l-4.656 8.064-.55-.318 4.653-8.062-8.061 4.655-.318-.551 8.063-4.657H0v-.636h9.31L1.248 5.527l.318-.55 8.061 4.654-4.654-8.06.55-.319 4.659 8.064V0h.636v9.313Z"
        fill="currentColor"
      />
    </svg>
  );
}
