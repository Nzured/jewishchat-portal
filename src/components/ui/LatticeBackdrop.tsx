import { cn } from "@/lib/utils";

export function LatticeBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-brand-green/25",
        className,
      )}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id="jc-lattice"
          width="56"
          height="97"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(0 0)"
        >
          <path
            d="M28 0 L56 16.17 L56 48.5 L28 64.67 L0 48.5 L0 16.17 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path
            d="M28 0 L28 64.67 M0 16.17 L56 48.5 M56 16.17 L0 48.5"
            stroke="currentColor"
            strokeWidth="0.5"
          />
        </pattern>
        <radialGradient id="jc-lattice-fade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="jc-lattice-mask">
          <rect width="100%" height="100%" fill="url(#jc-lattice-fade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#jc-lattice)" mask="url(#jc-lattice-mask)" />
    </svg>
  );
}
